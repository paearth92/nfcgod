/*
# Phase 6.5 Core Repairs — security, code normalization, checkout intents

## Overview
Forward-only repair migration that fixes security defects, normalizes NFC codes,
adds the checkout_intents table for Stripe checkout persistence, and tightens
RLS policies so customers cannot mutate protected fields.

## Changes

### 1. Code Normalization
- Adds normalize_code() helper function for canonical 8-char uppercase format
- Strips hyphens from existing code rows after checking for duplicates
- Replaces the loose charset CHECK constraint with an exact 8-char constraint
- No hyphens stored in the database going forward

### 2. Code Generation Security
- Replaces random()-based generator with pgcrypto gen_random_bytes()
- Removes hyphen insertion from generated codes
- Adds collision retry

### 3. Profile Security
- Drops profiles_update_own policy that let customers update their entire row
- Adds update_my_profile() RPC that only allows full_name and business_name
- role column is never customer-writable

### 4. Order Security
- Drops orders_update_own policy — customers get SELECT-only access
- Only admin/service-role workflows can change order fields

### 5. Code Security
- Drops codes_update_own policy — customers cannot directly UPDATE codes
- Destination changes must go through update_destination() RPC only

### 6. Checkout Intents
- New checkout_intents table for Stripe checkout persistence
- Stores validated line-item snapshot, totals, Stripe session ID
- No direct browser access (no RLS policies for anon/authenticated)

### 7. Order Items
- Adds required_code_count column (immutable snapshot of NFC code requirement)

### 8. Code Assignment Index
- Drops unique index on codes.order_item_id (one item can have many codes)
- Adds non-unique lookup index instead

### 9. RPC Hardening
- record_code_event: anon callers can only record 'redirect' events
- assign_code_to_order_item: validates order exists, payment paid, not cancelled,
  code is unclaimed/unowned, and checks required_code_count
- All SECURITY DEFINER functions: REVOKE broad grants, grant only intended roles
- Shared destination URL validation in update_destination and claim_code

### 10. Existing RPCs Updated
- lookup_code, claim_code, update_destination use normalize_code() helper
- generate_batch_codes uses gen_random_bytes() and stores codes without hyphens
*/

-- ============================================================================
-- Enable pgcrypto for gen_random_bytes
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. CODE NORMALIZATION HELPER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.normalize_code(input_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT upper(regexp_replace(trim(input_code), '[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]', '', 'g'));
$$;

-- ============================================================================
-- 2. NORMALIZE EXISTING CODES (strip hyphens, uppercase, remove invalid chars)
-- ============================================================================

DO $$
DECLARE
  dup_count int;
BEGIN
  WITH normalized AS (
    SELECT public.normalize_code(code) AS ncode, id
    FROM codes
  )
  SELECT count(*) INTO dup_count
  FROM (
    SELECT ncode
    FROM normalized
    GROUP BY ncode
    HAVING count(*) > 1
  ) dups;

  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Cannot normalize codes: % duplicate normalized codes detected. Resolve duplicates before re-running this migration.', dup_count
      USING ERRCODE = 'unique_violation';
  END IF;
END;
$$;

UPDATE codes SET code = public.normalize_code(code)
  WHERE code != public.normalize_code(code);

-- ============================================================================
-- 3. REPLACE CODE CONSTRAINT WITH EXACT 8-CHAR FORMAT
-- ============================================================================

ALTER TABLE codes DROP CONSTRAINT IF EXISTS code_charset;
ALTER TABLE codes ADD CONSTRAINT code_charset_exact
  CHECK (code ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$');

-- ============================================================================
-- 4. DROP UNIQUE INDEX ON codes.order_item_id, ADD NON-UNIQUE
-- ============================================================================

DROP INDEX IF EXISTS idx_codes_order_item_id_unique;
CREATE INDEX IF NOT EXISTS idx_codes_order_item_id
  ON codes(order_item_id) WHERE order_item_id IS NOT NULL;

-- ============================================================================
-- 5. ADD required_code_count TO order_items
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'required_code_count'
  ) THEN
    ALTER TABLE order_items ADD COLUMN required_code_count integer NOT NULL DEFAULT 1 CHECK (required_code_count >= 0);
  END IF;
END;
$$;

-- ============================================================================
-- 6. CREATE checkout_intents TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkout_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  line_items jsonb NOT NULL,
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents integer NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  stripe_checkout_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT checkout_intent_total_check CHECK (
    total_cents = subtotal_cents - discount_cents + shipping_cents + tax_cents
  )
);

ALTER TABLE checkout_intents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_checkout_intents_user_id ON checkout_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_intents_stripe_session ON checkout_intents(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_intents_status ON checkout_intents(status);
CREATE INDEX IF NOT EXISTS idx_checkout_intents_created_at ON checkout_intents(created_at DESC);

-- ============================================================================
-- 7. PROFILE SECURITY — drop broad update policy, add safe RPC
-- ============================================================================

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE OR REPLACE FUNCTION public.update_my_profile(
  full_name_input text,
  business_name_input text
)
RETURNS TABLE(success boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'You must be signed in.';
    RETURN;
  END IF;

  IF full_name_input IS NOT NULL AND length(trim(full_name_input)) > 80 THEN
    RETURN QUERY SELECT false, 'Name is too long (max 80 characters).';
    RETURN;
  END IF;

  IF business_name_input IS NOT NULL AND length(trim(business_name_input)) > 120 THEN
    RETURN QUERY SELECT false, 'Business name is too long (max 120 characters).';
    RETURN;
  END IF;

  UPDATE profiles
  SET
    full_name = CASE WHEN full_name_input IS NOT NULL THEN trim(full_name_input) ELSE full_name END,
    business_name = CASE WHEN business_name_input IS NOT NULL THEN trim(business_name_input) ELSE business_name END
  WHERE id = v_uid;

  RETURN QUERY SELECT true, 'success';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_my_profile(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_my_profile(text, text) TO authenticated;

-- ============================================================================
-- 8. ORDER SECURITY — drop customer update policy
-- ============================================================================

DROP POLICY IF EXISTS "orders_update_own" ON orders;

-- ============================================================================
-- 9. CODE SECURITY — drop customer update policy
-- ============================================================================

DROP POLICY IF EXISTS "codes_update_own" ON codes;

-- ============================================================================
-- 10. FIX generate_batch_codes — crypto random, no hyphens
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_batch_codes(
  batch_name text,
  batch_prefix text DEFAULT NULL,
  batch_notes text DEFAULT NULL,
  quantity int DEFAULT 100
)
RETURNS TABLE(code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
  v_count int := 0;
  v_code text;
  v_bytes bytea;
  v_idx int;
  v_char char;
  v_uid uuid := auth.uid();
  v_alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF quantity < 1 OR quantity > 5000 THEN
    RAISE EXCEPTION 'Quantity must be between 1 and 5000';
  END IF;

  IF batch_name IS NULL OR trim(batch_name) = '' THEN
    RAISE EXCEPTION 'Batch name is required';
  END IF;

  INSERT INTO batches (name, prefix, notes, created_by)
  VALUES (batch_name, batch_prefix, batch_notes, v_uid)
  RETURNING id INTO v_batch_id;

  WHILE v_count < quantity LOOP
    v_code := '';
    WHILE length(v_code) < 8 LOOP
      v_bytes := gen_random_bytes(8);
      FOR v_idx IN 0..7 LOOP
        IF length(v_code) >= 8 THEN EXIT; END IF;
        v_char := substr(v_alphabet, (get_byte(v_bytes, v_idx) % 32) + 1, 1);
        v_code := v_code || v_char;
      END LOOP;
    END LOOP;

    BEGIN
      INSERT INTO codes (code, batch_id)
      VALUES (v_code, v_batch_id);
      v_count := v_count + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;

  RETURN QUERY
  SELECT code FROM codes WHERE batch_id = v_batch_id ORDER BY created_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_batch_codes(text, text, text, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_batch_codes(text, text, text, int) TO authenticated;

-- ============================================================================
-- 11. FIX lookup_code — use normalize_code helper
-- ============================================================================

CREATE OR REPLACE FUNCTION public.lookup_code(code_input text)
RETURNS TABLE(code text, status text, destination_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
BEGIN
  normalized_code := public.normalize_code(code_input);

  IF length(normalized_code) != 8 OR normalized_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.code, c.status, c.destination_url
  FROM codes c
  WHERE c.code = normalized_code
    AND c.status != 'disabled';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_code(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_code(text) TO anon, authenticated;

-- ============================================================================
-- 12. FIX claim_code — use normalize_code, validate destination
-- ============================================================================

CREATE OR REPLACE FUNCTION public.claim_code(code_input text, destination_input text)
RETURNS TABLE(success boolean, error text, code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
  v_code RECORD;
  v_uid uuid := auth.uid();
  v_dest text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'You must be signed in to activate a code.', ''::text;
    RETURN;
  END IF;

  normalized_code := public.normalize_code(code_input);

  IF length(normalized_code) != 8 OR normalized_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$' THEN
    RETURN QUERY SELECT false, 'Invalid code format.', ''::text;
    RETURN;
  END IF;

  v_dest := trim(destination_input);
  IF v_dest !~ '^https?://' OR length(v_dest) > 2048 OR v_dest ~ '[\x00-\x1F]' THEN
    RETURN QUERY SELECT false, 'Destination URL must start with http:// or https://', ''::text;
    RETURN;
  END IF;

  SELECT * INTO v_code
  FROM codes
  WHERE code = normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code not found. Check your code and try again.', ''::text;
    RETURN;
  END IF;

  IF v_code.status = 'disabled' THEN
    RETURN QUERY SELECT false, 'This code has been disabled. Contact support for help.', ''::text;
    RETURN;
  END IF;

  IF v_code.owner_id IS NOT NULL THEN
    IF v_code.owner_id = v_uid THEN
      RETURN QUERY SELECT true, 'already_owned', v_code.code;
      RETURN;
    ELSE
      RETURN QUERY SELECT false, 'This code has already been activated by another account.', ''::text;
      RETURN;
    END IF;
  END IF;

  UPDATE codes
  SET
    owner_id = v_uid,
    destination_url = v_dest,
    status = 'active',
    activated_at = now()
  WHERE id = v_code.id;

  INSERT INTO code_events (code_id, event_type, user_id)
  VALUES (v_code.id, 'activation', v_uid);

  RETURN QUERY SELECT true, 'success', normalized_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_code(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_code(text, text) TO authenticated;

-- ============================================================================
-- 13. FIX update_destination — use normalize_code, validate URL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_destination(code_input text, destination_input text)
RETURNS TABLE(success boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
  v_code RECORD;
  v_uid uuid := auth.uid();
  v_dest text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'You must be signed in to update a destination.';
    RETURN;
  END IF;

  normalized_code := public.normalize_code(code_input);

  v_dest := trim(destination_input);
  IF v_dest !~ '^https?://' OR length(v_dest) > 2048 OR v_dest ~ '[\x00-\x1F]' THEN
    RETURN QUERY SELECT false, 'Destination URL must start with http:// or https://';
    RETURN;
  END IF;

  SELECT * INTO v_code FROM codes WHERE code = normalized_code FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code not found.';
    RETURN;
  END IF;

  IF v_code.owner_id != v_uid AND NOT public.is_admin() THEN
    RETURN QUERY SELECT false, 'You do not own this code.';
    RETURN;
  END IF;

  UPDATE codes
  SET destination_url = v_dest
  WHERE id = v_code.id;

  INSERT INTO code_events (code_id, event_type, user_id)
  VALUES (v_code.id, 'destination_update', v_uid);

  RETURN QUERY SELECT true, 'success';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_destination(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_destination(text, text) TO authenticated;

-- ============================================================================
-- 14. FIX record_code_event — anon can only record 'redirect' events
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_code_event(
  code_input text,
  event_type_input text,
  referrer_input text DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
  v_code_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF event_type_input != 'redirect' AND NOT public.is_admin() THEN
    RETURN;
  END IF;

  normalized_code := public.normalize_code(code_input);

  SELECT id INTO v_code_id FROM codes WHERE code = normalized_code;
  IF v_code_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO code_events (code_id, event_type, user_id, referrer, user_agent)
  VALUES (v_code_id, event_type_input, v_uid, referrer_input, user_agent_input);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_code_event(text, text, text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_code_event(text, text, text, text) TO anon, authenticated;

-- ============================================================================
-- 15. FIX assign_code_to_order_item — full validation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.assign_code_to_order_item(
  code_input text,
  order_item_id_input uuid
)
RETURNS TABLE(success boolean, error text, code_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
  v_code RECORD;
  v_order_item RECORD;
  v_order RECORD;
  v_uid uuid := auth.uid();
  v_assigned_count int;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RETURN QUERY SELECT false, 'Admin access required.', null::uuid;
    RETURN;
  END IF;

  normalized_code := public.normalize_code(code_input);

  IF length(normalized_code) != 8 OR normalized_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$' THEN
    RETURN QUERY SELECT false, 'Invalid code format.', null::uuid;
    RETURN;
  END IF;

  SELECT * INTO v_code
  FROM codes
  WHERE code = normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code not found.', null::uuid;
    RETURN;
  END IF;

  IF v_code.status = 'disabled' THEN
    RETURN QUERY SELECT false, 'Code is disabled.', null::uuid;
    RETURN;
  END IF;

  IF v_code.owner_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Code has already been activated by a customer.', null::uuid;
    RETURN;
  END IF;

  IF v_code.order_item_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Code is already assigned to another order item.', null::uuid;
    RETURN;
  END IF;

  SELECT * INTO v_order_item
  FROM order_items oi
  WHERE oi.id = order_item_id_input
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Order item not found.', null::uuid;
    RETURN;
  END IF;

  SELECT * INTO v_order
  FROM orders o
  WHERE o.id = v_order_item.order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Order not found.', null::uuid;
    RETURN;
  END IF;

  IF v_order.payment_status != 'paid' THEN
    RETURN QUERY SELECT false, 'Order payment is not complete.', null::uuid;
    RETURN;
  END IF;

  IF v_order.fulfillment_status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'Cannot assign codes to a cancelled order.', null::uuid;
    RETURN;
  END IF;

  SELECT count(*) INTO v_assigned_count
  FROM codes
  WHERE order_item_id = order_item_id_input;

  IF v_assigned_count >= v_order_item.required_code_count THEN
    RETURN QUERY SELECT false, 'This item already has all required codes assigned.', null::uuid;
    RETURN;
  END IF;

  UPDATE codes
  SET order_item_id = order_item_id_input
  WHERE id = v_code.id;

  INSERT INTO code_events (code_id, event_type, user_id)
  VALUES (v_code.id, 'assignment', v_uid);

  RETURN QUERY SELECT true, 'success', v_code.id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.assign_code_to_order_item(text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_code_to_order_item(text, uuid) TO authenticated;

-- ============================================================================
-- 16. FIX unassign_code_from_order_item — admin-only, unclaimed only
-- ============================================================================

CREATE OR REPLACE FUNCTION public.unassign_code_from_order_item(
  code_id_input uuid
)
RETURNS TABLE(success boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code RECORD;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RETURN QUERY SELECT false, 'Admin access required.';
    RETURN;
  END IF;

  SELECT * INTO v_code
  FROM codes
  WHERE id = code_id_input
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code not found.';
    RETURN;
  END IF;

  IF v_code.owner_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Cannot unassign an activated customer-owned code.';
    RETURN;
  END IF;

  IF v_code.order_item_id IS NULL THEN
    RETURN QUERY SELECT false, 'Code is not assigned to any order item.';
    RETURN;
  END IF;

  UPDATE codes
  SET order_item_id = null
  WHERE id = v_code.id;

  RETURN QUERY SELECT true, 'success';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.unassign_code_from_order_item(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unassign_code_from_order_item(uuid) TO authenticated;

-- ============================================================================
-- 17. UPDATE code_events CHECK — add 'assignment' event type
-- ============================================================================

ALTER TABLE code_events DROP CONSTRAINT IF EXISTS code_events_event_type_check;
ALTER TABLE code_events ADD CONSTRAINT code_events_event_type_check
  CHECK (event_type IN ('scan', 'activation', 'redirect', 'destination_update', 'disabled', 'assignment'));

-- ============================================================================
-- 18. REVOKE broad grants on is_admin
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

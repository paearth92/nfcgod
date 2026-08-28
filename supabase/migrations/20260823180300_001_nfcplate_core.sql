/*
# NFCPlate Core Schema — profiles, batches, codes, code_events

## Overview
Creates the core data model for the NFCPlate NFC/QR product system.
Each physical product has a unique code (https://nfcplate.com/c/CODE).
Unclaimed codes can be activated by a customer; active codes redirect
to a saved destination URL. Customers update destinations from their
dashboard without rewriting the NFC tag or reprinting the QR code.

## Tables
1. profiles — extends auth.users with role (customer/admin), full_name, business_name
2. batches — groups of generated codes created by admins
3. codes — individual NFC/QR codes with status (unclaimed/active/disabled), owner, destination_url
4. code_events — audit log for scans, activations, redirects, updates

## Security
- RLS on all tables: customers see only their own data, admins see all
- SECURITY DEFINER RPCs for public lookup, atomic claim, destination update, event recording
- No raw IP addresses stored

## RPCs
- is_admin(): checks current user's role
- lookup_code(code): public, returns minimal redirect/activation info
- claim_code(code, url): atomic authenticated claim with row locking
- update_destination(code, url): owner-scoped destination update
- record_code_event(code, event_type, referrer, user_agent): public event logging
- generate_batch_codes(name, prefix, notes, quantity): admin-only batch generation
*/

-- ============================================================================
-- UTILITY FUNCTIONS (no table dependencies)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'business_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  business_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Trigger: auto-create profile on auth user creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- is_admin() — defined after profiles table exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- RLS for profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- BATCHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prefix text,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_batches_created_by ON batches(created_by);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batches_name ON batches(name);

DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for batches: admin-only
DROP POLICY IF EXISTS "batches_admin_all" ON batches;
CREATE POLICY "batches_admin_all"
  ON batches FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- CODES
-- ============================================================================
CREATE TABLE IF NOT EXISTS codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  destination_url text,
  status text NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'active', 'disabled')),
  activated_at timestamptz,
  order_item_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT code_charset CHECK (
    code ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ-]+$'
  )
);

ALTER TABLE codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_owner_id ON codes(owner_id);
CREATE INDEX IF NOT EXISTS idx_codes_batch_id ON codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);
CREATE INDEX IF NOT EXISTS idx_codes_created_at ON codes(created_at DESC);

DROP TRIGGER IF EXISTS update_codes_updated_at ON codes;
CREATE TRIGGER update_codes_updated_at
  BEFORE UPDATE ON codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for codes
DROP POLICY IF EXISTS "codes_select_own" ON codes;
CREATE POLICY "codes_select_own"
  ON codes FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "codes_update_own" ON codes;
CREATE POLICY "codes_update_own"
  ON codes FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "codes_admin_insert" ON codes;
CREATE POLICY "codes_admin_insert"
  ON codes FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "codes_admin_delete" ON codes;
CREATE POLICY "codes_admin_delete"
  ON codes FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- CODE_EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS code_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('scan', 'activation', 'redirect', 'destination_update', 'disabled')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE code_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_code_events_code_id ON code_events(code_id);
CREATE INDEX IF NOT EXISTS idx_code_events_event_type ON code_events(event_type);
CREATE INDEX IF NOT EXISTS idx_code_events_created_at ON code_events(created_at DESC);

-- RLS for code_events
DROP POLICY IF EXISTS "code_events_select_own" ON code_events;
CREATE POLICY "code_events_select_own"
  ON code_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM codes
      WHERE codes.id = code_events.code_id
      AND (codes.owner_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "code_events_admin_insert" ON code_events;
CREATE POLICY "code_events_admin_insert"
  ON code_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- ============================================================================
-- PUBLIC RPCs (SECURITY DEFINER)
-- ============================================================================

-- lookup_code: public code lookup for redirect/activation
CREATE OR REPLACE FUNCTION public.lookup_code(code_input text)
RETURNS TABLE(code text, status text, destination_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text;
BEGIN
  normalized_code := upper(trim(code_input));
  normalized_code := replace(normalized_code, '-', '');

  RETURN QUERY
  SELECT c.code, c.status, c.destination_url
  FROM codes c
  WHERE c.code = normalized_code
    AND c.status != 'disabled';
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_code(text) TO anon, authenticated;

-- claim_code: atomic code activation
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
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'You must be signed in to activate a code.', ''::text;
    RETURN;
  END IF;

  normalized_code := upper(trim(code_input));
  normalized_code := replace(normalized_code, '-', '');

  IF length(normalized_code) != 8 OR normalized_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$' THEN
    RETURN QUERY SELECT false, 'Invalid code format.', ''::text;
    RETURN;
  END IF;

  IF destination_input !~ '^https?://' THEN
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
    destination_url = destination_input,
    status = 'active',
    activated_at = now()
  WHERE id = v_code.id;

  INSERT INTO code_events (code_id, event_type, user_id)
  VALUES (v_code.id, 'activation', v_uid);

  RETURN QUERY SELECT true, 'success', normalized_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_code(text, text) TO authenticated;

-- update_destination: update destination URL for an owned code
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
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'You must be signed in to update a destination.';
    RETURN;
  END IF;

  normalized_code := upper(trim(code_input));
  normalized_code := replace(normalized_code, '-', '');

  IF destination_input !~ '^https?://' THEN
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
  SET destination_url = destination_input
  WHERE id = v_code.id;

  INSERT INTO code_events (code_id, event_type, user_id)
  VALUES (v_code.id, 'destination_update', v_uid);

  RETURN QUERY SELECT true, 'success';
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_destination(text, text) TO authenticated;

-- record_code_event: public event logging
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
BEGIN
  normalized_code := upper(trim(code_input));
  normalized_code := replace(normalized_code, '-', '');

  SELECT id INTO v_code_id FROM codes WHERE code = normalized_code;
  IF v_code_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO code_events (code_id, event_type, referrer, user_agent)
  VALUES (v_code_id, event_type_input, referrer_input, user_agent_input);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_code_event(text, text, text, text) TO anon, authenticated;

-- ============================================================================
-- ADMIN RPC: batch generation
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
  v_uid uuid := auth.uid();
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
    v_code := upper(
      substr(
        (SELECT string_agg(
          substr(
            '23456789ABCDEFGHJKMNPQRSTUVWXYZ',
            ceil(random() * 32)::int,
            1
          ),
          ''
        )),
        1, 8
      )
    );

    BEGIN
      INSERT INTO codes (code, batch_id)
      VALUES (
        substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4),
        v_batch_id
      );
      v_count := v_count + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;

  RETURN QUERY
  SELECT code FROM codes WHERE batch_id = v_batch_id ORDER BY created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_batch_codes(text, text, text, int) TO authenticated;

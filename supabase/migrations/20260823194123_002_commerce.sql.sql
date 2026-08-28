/*
# NFCPlate Commerce Schema — orders, order_items, stripe_events, code assignment

## Overview
Extends the Phase 5 core schema with commerce tables for real U.S. order
fulfillment via Stripe Checkout. Creates orders with immutable line-item
snapshots, Stripe event idempotency, and links NFC codes to order items.

## Tables
1. orders — customer/guest orders with payment + fulfillment status
2. order_items — immutable line-item snapshots per order
3. stripe_events — webhook event idempotency log

## Key Design
- Order numbers are cryptographically unpredictable, non-sequential, unique
- Prices stored as integer minor currency units (cents)
- Order item snapshots are immutable — later catalog edits don't rewrite history
- codes.order_item_id links physical NFC codes to order items (Phase 5 already has this column)
- RLS: customers see only their own orders, admins see all, guests can't query directly
- SECURITY DEFINER RPCs for guest lookup and code assignment
*/

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,

  -- Stripe references
  stripe_customer_id text,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,

  -- Status
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),

  -- Money (integer minor currency units)
  currency text NOT NULL DEFAULT 'usd',
  subtotal_cents integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents integer NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),

  -- Shipping address snapshot
  shipping_name text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text NOT NULL DEFAULT 'US',

  -- Tracking
  tracking_carrier text,
  tracking_number text,
  tracking_url text,

  -- Timestamps
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT order_total_consistency CHECK (
    total_cents = subtotal_cents - discount_cents + shipping_cents + tax_cents
  )
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for orders: customers see only their own, admins see all
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- ORDER_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  variant_id text NOT NULL,
  variant_name text NOT NULL,
  sku text NOT NULL,
  image_path text,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents > 0),
  quantity integer NOT NULL CHECK (quantity >= 1),
  line_total_cents integer NOT NULL CHECK (line_total_cents > 0),
  bundle_components jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT order_item_total_check CHECK (
    line_total_cents = unit_price_cents * quantity
  )
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_slug ON order_items(product_slug);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);

-- RLS for order_items: customers see only their own order's items
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ============================================================================
-- STRIPE_EVENTS — webhook idempotency log
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed', 'failed', 'skipped')),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_status ON stripe_events(status);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at DESC);

-- Only admin can read stripe_events
DROP POLICY IF EXISTS "stripe_events_admin_select" ON stripe_events;
CREATE POLICY "stripe_events_admin_select"
  ON stripe_events FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- CODE ASSIGNMENT — add FK constraint to existing codes.order_item_id
-- ============================================================================

-- The codes table already has order_item_id from Phase 5.
-- Add the foreign key constraint and a unique index to prevent
-- double-assignment of the same code to multiple order items.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'codes_order_item_id_fkey'
    AND table_name = 'codes'
  ) THEN
    ALTER TABLE codes
      ADD CONSTRAINT codes_order_item_id_fkey
      FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Unique index ensures one code can only be assigned to one order item
CREATE UNIQUE INDEX IF NOT EXISTS idx_codes_order_item_id_unique
  ON codes(order_item_id) WHERE order_item_id IS NOT NULL;

-- Index for finding unclaimed codes for assignment
CREATE INDEX IF NOT EXISTS idx_codes_unclaimed_for_assignment
  ON codes(status, batch_id)
  WHERE status = 'unclaimed' AND owner_id IS NULL;

-- ============================================================================
-- RPC: guest_order_lookup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.guest_order_lookup(
  order_number_input text,
  email_input text
)
RETURNS TABLE(
  order_number text,
  payment_status text,
  fulfillment_status text,
  total_cents integer,
  currency text,
  created_at timestamptz,
  tracking_carrier text,
  tracking_number text,
  tracking_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE order_number = upper(trim(order_number_input))
    AND customer_email = lower(trim(email_input))
    AND payment_status != 'failed'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    v_order.order_number,
    v_order.payment_status,
    v_order.fulfillment_status,
    v_order.total_cents,
    v_order.currency,
    v_order.created_at,
    v_order.tracking_carrier,
    v_order.tracking_number,
    v_order.tracking_url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.guest_order_lookup(text, text) TO anon, authenticated;

-- ============================================================================
-- RPC: assign_code_to_order_item
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
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RETURN QUERY SELECT false, 'Admin access required.', null::uuid;
    RETURN;
  END IF;

  normalized_code := upper(trim(code_input));
  normalized_code := replace(normalized_code, '-', '');

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

  UPDATE codes
  SET order_item_id = order_item_id_input
  WHERE id = v_code.id;

  RETURN QUERY SELECT true, 'success', v_code.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_code_to_order_item(text, uuid) TO authenticated;

-- ============================================================================
-- RPC: unassign_code_from_order_item
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

GRANT EXECUTE ON FUNCTION public.unassign_code_from_order_item(uuid) TO authenticated;

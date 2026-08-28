/**
 * Server-only order actions: create orders from Stripe webhook events,
 * manage fulfillment, assign codes. All operations use the service-role
 * admin client and verify authorization.
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  validateAndCalculateOrder,
  type ValidatedOrder,
  type ValidatedLineItem,
} from '@/lib/checkout-validation';
import { generateOrderNumber } from '@/lib/order-utils';
import type Stripe from 'stripe';

type AnySupabase = any;

interface CheckoutIntentRow {
  id: string;
  user_id: string | null;
  line_items: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  status: string;
}

/* -------------------------------------------------------------------------- */
/*  Create order from checkout intent (service-role, no auth check)           */
/* -------------------------------------------------------------------------- */

export async function createOrderFromCheckoutIntent(
  session: Stripe.Checkout.Session,
  intentId: string
): Promise<{ orderId: string; orderNumber: string } | { error: string }> {
  const admin = createAdminClient() as unknown as AnySupabase;

  // Load the checkout intent
  const { data: intentRow, error: intentError } = await admin
    .from('checkout_intents')
    .select('*')
    .eq('id', intentId)
    .maybeSingle();

  if (intentError || !intentRow) {
    return { error: 'Checkout intent not found.' };
  }

  const intent = intentRow as CheckoutIntentRow;

  // Verify the Stripe session ID matches
  if (intent.stripe_checkout_session_id !== session.id) {
    return { error: 'Checkout intent session mismatch.' };
  }

  // Verify currency and amount match what was stored
  const sessionTotal = session.amount_total ?? 0;
  if (intent.total_cents !== sessionTotal) {
    return { error: 'Checkout intent amount mismatch.' };
  }

  // Parse the validated line items from the intent
  let storedItems: ValidatedLineItem[];
  try {
    storedItems = JSON.parse(intent.line_items);
  } catch {
    return { error: 'Invalid line items in checkout intent.' };
  }

  // Re-validate from the authoritative catalog to ensure prices haven't changed
  let validated: ValidatedOrder;
  try {
    validated = validateAndCalculateOrder(
      storedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Order validation failed.' };
  }

  // Verify the validated total matches the intent total
  if (validated.totalCents !== intent.total_cents) {
    return { error: 'Order total mismatch after revalidation.' };
  }

  // Check if order already exists for this session (idempotency)
  const { data: existingOrder } = await admin
    .from('orders')
    .select('id, order_number')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  if (existingOrder) {
    return {
      orderId: (existingOrder as { id: string }).id,
      orderNumber: (existingOrder as { order_number: string }).order_number,
    };
  }

  // Generate a unique order number with collision retry
  let orderNumber = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await admin
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (!existing) break;
    orderNumber = generateOrderNumber();
  }

  const sessionAny = session as unknown as {
    shipping_details?: {
      name?: string | null;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        state?: string | null;
        postal_code?: string | null;
        country?: string | null;
      } | null;
    } | null;
    customer_details?: {
      email?: string | null;
      name?: string | null;
      phone?: string | null;
    } | null;
    customer?: string | null;
    customer_email?: string | null;
    payment_intent?: string | null;
    payment_status?: string;
    id: string;
    metadata?: Record<string, string | null> | null;
    shipping_cost?: { amount_subtotal?: number; amount_total?: number } | null;
  };
  const shippingDetails = sessionAny.shipping_details;
  const customerEmail = sessionAny.customer_details?.email ?? sessionAny.customer_email ?? '';
  const customerName = sessionAny.customer_details?.name ?? shippingDetails?.name ?? '';
  const customerPhone = sessionAny.customer_details?.phone ?? '';

  const { data: orderData, error: orderError } = await admin
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: intent.user_id ?? sessionAny.metadata?.user_id ?? null,
      customer_email: customerEmail.toLowerCase().trim(),
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      stripe_customer_id: typeof sessionAny.customer === 'string' ? sessionAny.customer : null,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof sessionAny.payment_intent === 'string' ? sessionAny.payment_intent : null,
      payment_status: sessionAny.payment_status === 'paid' ? 'paid' : 'pending',
      fulfillment_status: 'unfulfilled',
      currency: validated.currency,
      subtotal_cents: validated.subtotalCents,
      discount_cents: intent.discount_cents,
      shipping_cents: validated.shippingCents,
      tax_cents: validated.taxCents,
      total_cents: validated.totalCents,
      shipping_name: shippingDetails?.name ?? null,
      shipping_address_line1: shippingDetails?.address?.line1 ?? null,
      shipping_address_line2: shippingDetails?.address?.line2 ?? null,
      shipping_city: shippingDetails?.address?.city ?? null,
      shipping_state: shippingDetails?.address?.state ?? null,
      shipping_postal_code: shippingDetails?.address?.postal_code ?? null,
      shipping_country: shippingDetails?.address?.country ?? 'US',
      paid_at: sessionAny.payment_status === 'paid' ? new Date().toISOString() : null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !orderData) {
    return { error: orderError?.message ?? 'Failed to create order.' };
  }

  const orderId = orderData.id;
  const orderItems = validated.lineItems.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_slug: item.productSlug,
    product_name: item.productName,
    variant_id: item.variantId,
    variant_name: item.variantName,
    sku: item.sku,
    image_path: item.imagePath,
    unit_price_cents: item.unitPriceCents,
    quantity: item.quantity,
    line_total_cents: item.lineTotalCents,
    required_code_count: item.requiredCodeCount,
    bundle_components: item.bundleComponents ? JSON.stringify(item.bundleComponents) : null,
  }));

  const { error: itemsError } = await admin.from('order_items').insert(orderItems);

  if (itemsError) {
    return { error: itemsError.message };
  }

  // Mark the checkout intent as completed
  await admin
    .from('checkout_intents')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('id', intentId);

  return { orderId, orderNumber };
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentIntentId?: string
): Promise<void> {
  const admin = createAdminClient() as unknown as AnySupabase;
  const updates: Record<string, unknown> = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };
  if (paymentStatus === 'paid') {
    updates.paid_at = new Date().toISOString();
  }
  if (paymentIntentId) {
    updates.stripe_payment_intent_id = paymentIntentId;
  }
  await admin.from('orders').update(updates).eq('id', orderId);
}

/* -------------------------------------------------------------------------- */
/*  Admin fulfillment actions                                                 */
/* -------------------------------------------------------------------------- */

export type AdminOrderResult = { success: true } | { success: false; error: string };

async function requireAdmin(accessToken: string) {
  if (!accessToken) return null;
  const admin = createAdminClient() as unknown as AnySupabase;
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(accessToken);

  if (userError || !user) return null;

  const { data: profileData } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as { role: string } | null;
  if (!profile || profile.role !== 'admin') return null;

  return { admin, userId: user.id };
}

export async function updateFulfillmentStatus(
  accessToken: string,
  orderId: string,
  status: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  carrier?: string,
  trackingNumber?: string,
  trackingUrl?: string
): Promise<AdminOrderResult> {
  const auth = await requireAdmin(accessToken);
  if (!auth) return { success: false, error: 'Your admin session expired. Sign in again.' };
  const { admin } = auth;

  // Prevent shipping/refunded/failed/cancelled orders from being moved to shipped/delivered
  const { data: order } = await admin
    .from('orders')
    .select('payment_status, fulfillment_status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  const orderRow = order as { payment_status: string; fulfillment_status: string };

  if ((status === 'shipped' || status === 'delivered') && orderRow.payment_status !== 'paid') {
    return { success: false, error: 'Cannot ship an unpaid order.' };
  }

  if (['refunded', 'partially_refunded', 'failed', 'cancelled'].includes(orderRow.fulfillment_status)) {
    return { success: false, error: 'Cannot change status of a cancelled, refunded, or failed order.' };
  }

  // For shipped status, require tracking number and check code assignment
  if (status === 'shipped') {
    if (!trackingNumber?.trim()) {
      return { success: false, error: 'Tracking number is required to ship an order.' };
    }

    // Check all order items have their required codes assigned
    const { data: items } = await admin
      .from('order_items')
      .select('id, required_code_count')
      .eq('order_id', orderId);

    if (items) {
      for (const item of items as { id: string; required_code_count: number }[]) {
        const { count } = await admin
          .from('codes')
          .select('*', { count: 'exact', head: true })
          .eq('order_item_id', item.id);

        if ((count ?? 0) < item.required_code_count) {
          return {
            success: false,
            error: 'All required NFC codes must be assigned before shipping.',
          };
        }
      }
    }
  }

  const updates: Record<string, unknown> = {
    fulfillment_status: status,
    updated_at: new Date().toISOString(),
  };

  if (carrier !== undefined) updates.tracking_carrier = carrier || null;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber || null;
  if (trackingUrl !== undefined) {
    if (trackingUrl && !trackingUrl.match(/^https?:\/\//)) {
      return { success: false, error: 'Tracking URL must start with http:// or https://' };
    }
    updates.tracking_url = trackingUrl || null;
  }

  if (status === 'shipped') updates.shipped_at = new Date().toISOString();
  if (status === 'delivered') updates.delivered_at = new Date().toISOString();
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

  const { error } = await admin.from('orders').update(updates).eq('id', orderId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function assignCodeToOrderItem(
  accessToken: string,
  codeInput: string,
  orderItemId: string
): Promise<AdminOrderResult & { codeId?: string }> {
  if (!codeInput?.trim() || !orderItemId) {
    return { success: false, error: 'Code and order item are required.' };
  }
  const auth = await requireAdmin(accessToken);
  if (!auth) return { success: false, error: 'Your admin session expired. Sign in again.' };
  const { admin } = auth;

  const { data, error } = await admin.rpc('assign_code_to_order_item', {
    code_input: codeInput,
    order_item_id_input: orderItemId,
  });

  if (error) return { success: false, error: error.message };
  const result = (data ?? [])[0] as { success: boolean; error: string; code_id: string };
  if (!result.success) return { success: false, error: result.error };
  return { success: true, codeId: result.code_id };
}

export async function unassignCodeFromOrderItem(
  accessToken: string,
  codeId: string
): Promise<AdminOrderResult> {
  if (!codeId) return { success: false, error: 'Code ID is required.' };
  const auth = await requireAdmin(accessToken);
  if (!auth) return { success: false, error: 'Your admin session expired. Sign in again.' };
  const { admin } = auth;

  const { data, error } = await admin.rpc('unassign_code_from_order_item', {
    code_id_input: codeId,
  });

  if (error) return { success: false, error: error.message };
  const result = (data ?? [])[0] as { success: boolean; error: string };
  if (!result.success) return { success: false, error: result.error };
  return { success: true };
}

export type CodeStatus = 'unclaimed' | 'active' | 'disabled';

export type CodeEventType = 'scan' | 'activation' | 'redirect' | 'destination_update' | 'disabled' | 'assignment';

export type CheckoutIntentStatus = 'pending' | 'completed' | 'expired' | 'failed';

export type UserRole = 'customer' | 'admin';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type StripeEventStatus = 'processing' | 'processed' | 'failed' | 'skipped';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          business_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          business_name?: string | null;
          role?: UserRole;
        };
        Update: {
          full_name?: string | null;
          business_name?: string | null;
          role?: UserRole;
        };
      };
      batches: {
        Row: {
          id: string;
          name: string;
          prefix: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          prefix?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          prefix?: string | null;
          notes?: string | null;
        };
      };
      codes: {
        Row: {
          id: string;
          code: string;
          batch_id: string | null;
          owner_id: string | null;
          destination_url: string | null;
          status: CodeStatus;
          activated_at: string | null;
          order_item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          batch_id?: string | null;
          owner_id?: string | null;
          destination_url?: string | null;
          status?: CodeStatus;
          activated_at?: string | null;
          order_item_id?: string | null;
        };
        Update: {
          destination_url?: string | null;
          status?: CodeStatus;
          activated_at?: string | null;
          order_item_id?: string | null;
        };
      };
      code_events: {
        Row: {
          id: string;
          code_id: string;
          event_type: CodeEventType;
          user_id: string | null;
          referrer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          code_id: string;
          event_type: CodeEventType;
          user_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {};
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_email: string;
          customer_name: string | null;
          customer_phone: string | null;
          stripe_customer_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          payment_status: PaymentStatus;
          fulfillment_status: FulfillmentStatus;
          currency: string;
          subtotal_cents: number;
          discount_cents: number;
          shipping_cents: number;
          tax_cents: number;
          total_cents: number;
          shipping_name: string | null;
          shipping_address_line1: string | null;
          shipping_address_line2: string | null;
          shipping_city: string | null;
          shipping_state: string | null;
          shipping_postal_code: string | null;
          shipping_country: string;
          tracking_carrier: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          paid_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_number: string;
          user_id?: string | null;
          customer_email: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          currency?: string;
          subtotal_cents: number;
          discount_cents?: number;
          shipping_cents: number;
          tax_cents?: number;
          total_cents: number;
          shipping_name?: string | null;
          shipping_address_line1?: string | null;
          shipping_address_line2?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_postal_code?: string | null;
          shipping_country?: string;
          tracking_carrier?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          paid_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: {
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          tracking_carrier?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          paid_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          stripe_payment_intent_id?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_slug: string;
          product_name: string;
          variant_id: string;
          variant_name: string;
          sku: string;
          image_path: string | null;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          bundle_components: string | null;
          required_code_count: number;
          created_at: string;
        };
        Insert: {
          order_id: string;
          product_id: string;
          product_slug: string;
          product_name: string;
          variant_id: string;
          variant_name: string;
          sku: string;
          image_path?: string | null;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          bundle_components?: string | null;
          required_code_count?: number;
        };
        Update: {};
      };
      checkout_intents: {
        Row: {
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
          status: CheckoutIntentStatus;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          user_id?: string | null;
          line_items: string;
          subtotal_cents: number;
          discount_cents?: number;
          shipping_cents: number;
          tax_cents?: number;
          total_cents: number;
          currency?: string;
          stripe_checkout_session_id?: string | null;
          status?: CheckoutIntentStatus;
          processed_at?: string | null;
        };
        Update: {
          stripe_checkout_session_id?: string | null;
          status?: CheckoutIntentStatus;
          processed_at?: string | null;
        };
      };
      stripe_events: {
        Row: {
          id: string;
          event_type: string;
          status: StripeEventStatus;
          order_id: string | null;
          error_message: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id: string;
          event_type: string;
          status?: StripeEventStatus;
          order_id?: string | null;
          error_message?: string | null;
          processed_at?: string | null;
        };
        Update: {
          status?: StripeEventStatus;
          order_id?: string | null;
          error_message?: string | null;
          processed_at?: string | null;
        };
      };
    };
    Functions: {
      lookup_code: {
        Args: { code_input: string };
        Returns: { code: string; status: CodeStatus; destination_url: string | null }[];
      };
      claim_code: {
        Args: { code_input: string; destination_input: string };
        Returns: { success: boolean; error: string; code: string }[];
      };
      update_destination: {
        Args: { code_input: string; destination_input: string };
        Returns: { success: boolean; error: string }[];
      };
      record_code_event: {
        Args: { code_input: string; event_type_input: string; referrer_input?: string | null; user_agent_input?: string | null };
        Returns: void;
      };
      generate_batch_codes: {
        Args: { batch_name: string; batch_prefix?: string | null; batch_notes?: string | null; quantity?: number };
        Returns: { code: string }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      normalize_code: {
        Args: { input_code: string };
        Returns: string;
      };
      update_my_profile: {
        Args: { full_name_input: string; business_name_input: string };
        Returns: { success: boolean; error: string }[];
      };
      guest_order_lookup: {
        Args: { order_number_input: string; email_input: string };
        Returns: {
          order_number: string;
          payment_status: string;
          fulfillment_status: string;
          total_cents: number;
          currency: string;
          created_at: string;
          tracking_carrier: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
        }[];
      };
      assign_code_to_order_item: {
        Args: { code_input: string; order_item_id_input: string };
        Returns: { success: boolean; error: string; code_id: string }[];
      };
      unassign_code_from_order_item: {
        Args: { code_id_input: string };
        Returns: { success: boolean; error: string }[];
      };
    };
  };
}

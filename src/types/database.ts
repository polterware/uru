export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      roles: {
        Row: {
          id: string;
          code: "admin" | "operator" | "analyst";
          name: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          code: "admin" | "operator" | "analyst";
          name: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          role_id?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          title: string;
          description: string | null;
          images: string[];
          category_id: string | null;
          brand_id: string | null;
          line_id: string | null;
          price: number;
          cost: number | null;
          is_published: boolean;
          weight: number | null;
          height: number | null;
          width: number | null;
          depth: number | null;
          metadata: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          sku: string;
          slug: string;
          title: string;
          description?: string | null;
          images?: string[];
          category_id?: string | null;
          brand_id?: string | null;
          line_id?: string | null;
          price: number;
          cost?: number | null;
          is_published?: boolean;
          weight?: number | null;
          height?: number | null;
          width?: number | null;
          depth?: number | null;
          metadata?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          sku?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          images?: string[];
          category_id?: string | null;
          brand_id?: string | null;
          line_id?: string | null;
          price?: number;
          cost?: number | null;
          is_published?: boolean;
          weight?: number | null;
          height?: number | null;
          width?: number | null;
          depth?: number | null;
          metadata?: Json;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          slug?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      lines: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          slug?: string;
          image_url?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          customer_id: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      customer_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      customer_group_memberships: {
        Row: {
          id: string;
          customer_id: string;
          customer_group_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          customer_id: string;
          customer_group_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          customer_group_id?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      locations: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: "warehouse" | "store" | "transit";
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type?: "warehouse" | "store" | "transit";
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          code?: string;
          name?: string;
          type?: "warehouse" | "store" | "transit";
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      inventory_levels: {
        Row: {
          id: string;
          product_id: string;
          location_id: string;
          quantity_on_hand: number;
          quantity_reserved: number;
          quantity_available: number;
          reorder_point: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          product_id: string;
          location_id: string;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          quantity_available?: number;
          reorder_point?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          quantity_on_hand?: number;
          quantity_reserved?: number;
          quantity_available?: number;
          reorder_point?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          inventory_level_id: string;
          movement_type:
            | "inbound"
            | "outbound"
            | "adjustment"
            | "reservation"
            | "release";
          quantity: number;
          reason: string | null;
          reference_type: string | null;
          reference_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          inventory_level_id: string;
          movement_type:
            | "inbound"
            | "outbound"
            | "adjustment"
            | "reservation"
            | "release";
          quantity: number;
          reason?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          reason?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      checkouts: {
        Row: {
          id: string;
          token: string;
          customer_id: string | null;
          status: "open" | "completed" | "expired" | "abandoned";
          total_amount: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          token: string;
          customer_id?: string | null;
          status?: "open" | "completed" | "expired" | "abandoned";
          total_amount?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          customer_id?: string | null;
          status?: "open" | "completed" | "expired" | "abandoned";
          total_amount?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          checkout_id: string | null;
          status: "pending" | "confirmed" | "fulfilled" | "cancelled";
          payment_status:
            | "pending"
            | "paid"
            | "refunded"
            | "partially_refunded";
          fulfillment_status:
            | "unfulfilled"
            | "partial"
            | "fulfilled"
            | "cancelled";
          subtotal_amount: number;
          discount_amount: number;
          tax_amount: number;
          shipping_amount: number;
          total_amount: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          checkout_id?: string | null;
          status?: "pending" | "confirmed" | "fulfilled" | "cancelled";
          payment_status?:
            | "pending"
            | "paid"
            | "refunded"
            | "partially_refunded";
          fulfillment_status?:
            | "unfulfilled"
            | "partial"
            | "fulfilled"
            | "cancelled";
          subtotal_amount?: number;
          discount_amount?: number;
          tax_amount?: number;
          shipping_amount?: number;
          total_amount?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          customer_id?: string | null;
          checkout_id?: string | null;
          status?: "pending" | "confirmed" | "fulfilled" | "cancelled";
          payment_status?:
            | "pending"
            | "paid"
            | "refunded"
            | "partially_refunded";
          fulfillment_status?:
            | "unfulfilled"
            | "partial"
            | "fulfilled"
            | "cancelled";
          subtotal_amount?: number;
          discount_amount?: number;
          tax_amount?: number;
          shipping_amount?: number;
          total_amount?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      transactions: {
        Row: {
          id: string;
          order_id: string | null;
          checkout_id: string | null;
          status:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          total_amount: number;
          currency: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          checkout_id?: string | null;
          status?:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          total_amount: number;
          currency?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          order_id?: string | null;
          checkout_id?: string | null;
          status?:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          total_amount?: number;
          currency?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          kind: "product" | "shipping" | "discount" | "tax" | "fee";
          reference_id: string | null;
          amount: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          transaction_id: string;
          kind: "product" | "shipping" | "discount" | "tax" | "fee";
          reference_id?: string | null;
          amount: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          reference_id?: string | null;
          amount?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          transaction_id: string | null;
          method: string;
          status:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          amount: number;
          currency: string;
          provider_reference: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          transaction_id?: string | null;
          method: string;
          status?:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          amount: number;
          currency?: string;
          provider_reference?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          method?: string;
          status?:
            | "pending"
            | "authorized"
            | "captured"
            | "failed"
            | "cancelled"
            | "refunded";
          amount?: number;
          currency?: string;
          provider_reference?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      refunds: {
        Row: {
          id: string;
          payment_id: string;
          order_id: string;
          status: "pending" | "approved" | "rejected" | "processed";
          amount: number;
          reason: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          payment_id: string;
          order_id: string;
          status?: "pending" | "approved" | "rejected" | "processed";
          amount: number;
          reason?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          status?: "pending" | "approved" | "rejected" | "processed";
          amount?: number;
          reason?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      shipments: {
        Row: {
          id: string;
          order_id: string;
          status: "pending" | "packed" | "shipped" | "delivered" | "cancelled";
          carrier: string | null;
          tracking_number: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          order_id: string;
          status?: "pending" | "packed" | "shipped" | "delivered" | "cancelled";
          carrier?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          status?: "pending" | "packed" | "shipped" | "delivered" | "cancelled";
          carrier?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      shipment_items: {
        Row: {
          id: string;
          shipment_id: string;
          order_item_id: string;
          quantity: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          shipment_id: string;
          order_item_id: string;
          quantity: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          quantity?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      shipment_events: {
        Row: {
          id: string;
          shipment_id: string;
          event_type: string;
          payload: Json;
          occurred_at: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          shipment_id: string;
          event_type: string;
          payload?: Json;
          occurred_at?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          event_type?: string;
          payload?: Json;
          occurred_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      inquiries: {
        Row: {
          id: string;
          customer_id: string | null;
          product_id: string | null;
          subject: string;
          status: "open" | "pending" | "resolved" | "closed";
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          product_id?: string | null;
          subject: string;
          status?: "open" | "pending" | "resolved" | "closed";
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          subject?: string;
          status?: "open" | "pending" | "resolved" | "closed";
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      inquiry_messages: {
        Row: {
          id: string;
          inquiry_id: string;
          author_id: string;
          message: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          inquiry_id: string;
          author_id: string;
          message: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          message?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_id?: string | null;
          rating: number;
          title?: string | null;
          body?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          rating?: number;
          title?: string | null;
          body?: string | null;
          status?: "pending" | "approved" | "rejected";
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      product_metrics: {
        Row: {
          id: string;
          product_id: string;
          metric_date: string;
          views: number;
          add_to_cart: number;
          sales_count: number;
          revenue_amount: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          product_id: string;
          metric_date: string;
          views?: number;
          add_to_cart?: number;
          sales_count?: number;
          revenue_amount?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          views?: number;
          add_to_cart?: number;
          sales_count?: number;
          revenue_amount?: number;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      pos_sessions: {
        Row: {
          id: string;
          opened_by: string;
          opened_at: string;
          closed_at: string | null;
          opening_amount: number;
          closing_amount: number | null;
          status: "open" | "closed";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          opened_by: string;
          opened_at?: string;
          closed_at?: string | null;
          opening_amount?: number;
          closing_amount?: number | null;
          status?: "open" | "closed";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          closed_at?: string | null;
          opening_amount?: number;
          closing_amount?: number | null;
          status?: "open" | "closed";
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          name?: string;
          color?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
      product_tags: {
        Row: {
          id: string;
          product_id: string;
          tag_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: "active" | "inactive" | "archived";
        };
        Insert: {
          id?: string;
          product_id: string;
          tag_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
        Update: {
          product_id?: string;
          tag_id?: string;
          updated_at?: string;
          deleted_at?: string | null;
          lifecycle_status?: "active" | "inactive" | "archived";
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_first_admin: {
        Args: { p_user_email: string };
        Returns: boolean;
      };
      reserve_inventory_stock: {
        Args: {
          p_product_id: string;
          p_location_id: string;
          p_quantity: number;
          p_reason?: string | null;
        };
        Returns: { inventory_level_id: string; quantity_reserved: number };
      };
      release_inventory_stock: {
        Args: {
          p_product_id: string;
          p_location_id: string;
          p_quantity: number;
          p_reason?: string | null;
        };
        Returns: { inventory_level_id: string; quantity_available: number };
      };
      finalize_sale: {
        Args: { p_checkout_id: string };
        Returns: {
          order_id: string;
          transaction_id: string;
          payment_id: string;
        };
      };
      create_order_with_items: {
        Args: { p_customer_id?: string | null; p_items: Json };
        Returns: { order_id: string; order_number: string };
      };
      cancel_order_with_restock: {
        Args: { p_order_id: string; p_reason?: string | null };
        Returns: { order_id: string; status: string };
      };
      request_refund: {
        Args: {
          p_payment_id: string;
          p_amount: number;
          p_reason?: string | null;
        };
        Returns: { refund_id: string; status: string };
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_status: string;
          p_payment_status?: string | null;
          p_fulfillment_status?: string | null;
        };
        Returns: { order_id: string; status: string };
      };
      console_profiles_list: {
        Args: { p_include_archived?: boolean | null };
        Returns: Array<{
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: string;
          roles_count: number;
          role_names_csv: string;
        }>;
      };
      console_customers_list: {
        Args: { p_include_archived?: boolean | null };
        Returns: Array<{
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: string;
          groups_count: number;
          group_names_csv: string;
        }>;
      };
      console_orders_list: {
        Args: { p_include_archived?: boolean | null };
        Returns: Array<{
          id: string;
          order_number: string;
          customer_id: string | null;
          checkout_id: string | null;
          status: string;
          payment_status: string;
          fulfillment_status: string;
          subtotal_amount: number;
          discount_amount: number;
          tax_amount: number;
          shipping_amount: number;
          total_amount: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: string;
          items_count: number;
          items_quantity_total: number;
          items_total_amount: number;
        }>;
      };
      console_transactions_list: {
        Args: { p_include_archived?: boolean | null };
        Returns: Array<{
          id: string;
          order_id: string | null;
          checkout_id: string | null;
          status: string;
          total_amount: number;
          currency: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: string;
          items_count: number;
          items_total_amount: number;
          item_kinds_csv: string;
        }>;
      };
      console_shipments_list: {
        Args: { p_include_archived?: boolean | null };
        Returns: Array<{
          id: string;
          order_id: string;
          status: string;
          carrier: string | null;
          tracking_number: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          lifecycle_status: string;
          items_count: number;
          items_quantity_total: number;
        }>;
      };
      console_profile_roles_detail: {
        Args: { p_user_id: string };
        Returns: Array<{ role_id: string }>;
      };
      console_customer_groups_detail: {
        Args: { p_customer_id: string };
        Returns: Array<{ group_id: string }>;
      };
      console_order_items_detail: {
        Args: { p_order_id: string };
        Returns: Array<{
          id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
        }>;
      };
      console_transaction_items_detail: {
        Args: { p_transaction_id: string };
        Returns: Array<{
          id: string;
          kind: "product" | "shipping" | "discount" | "tax" | "fee";
          reference_id: string | null;
          amount: number;
        }>;
      };
      console_shipment_items_detail: {
        Args: { p_shipment_id: string };
        Returns: Array<{
          id: string;
          order_item_id: string;
          quantity: number;
        }>;
      };
      console_profile_roles_sync: {
        Args: { p_user_id: string; p_role_ids?: Array<string> | null };
        Returns: Array<{ target_count: number; active_count: number }>;
      };
      console_customer_groups_sync: {
        Args: { p_customer_id: string; p_group_ids?: Array<string> | null };
        Returns: Array<{ target_count: number; active_count: number }>;
      };
      console_order_items_sync: {
        Args: {
          p_order_id: string;
          p_items:
            | Array<{
                id?: string | null;
                product_id: string;
                quantity: number;
                unit_price: number;
              }>
            | Json;
        };
        Returns: Array<{
          items_count: number;
          subtotal_amount: number;
          total_amount: number;
        }>;
      };
      console_transaction_items_sync: {
        Args: {
          p_transaction_id: string;
          p_items:
            | Array<{
                id?: string | null;
                kind: "product" | "shipping" | "discount" | "tax" | "fee";
                reference_id?: string | null;
                amount: number;
              }>
            | Json;
        };
        Returns: Array<{ items_count: number; total_amount: number }>;
      };
      console_shipment_items_sync: {
        Args: {
          p_shipment_id: string;
          p_items:
            | Array<{
                id?: string | null;
                order_item_id: string;
                quantity: number;
              }>
            | Json;
        };
        Returns: Array<{ items_count: number; items_quantity_total: number }>;
      };
      analytics_sales_overview: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          gross_sales: number;
          paid_sales: number;
          refunded_amount: number;
          net_sales: number;
          orders_count: number;
          paid_orders_count: number;
          avg_ticket: number;
          cancelled_orders_count: number;
          cancellation_rate: number;
        }>;
      };
      analytics_sales_timeseries: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_bucket?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          bucket_date: string;
          gross_sales: number;
          paid_sales: number;
          refunded_amount: number;
          net_sales: number;
          orders_count: number;
        }>;
      };
      analytics_orders_status_breakdown: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          status: string;
          orders_count: number;
          total_amount: number;
        }>;
      };
      analytics_payments_overview: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          captured_amount: number;
          pending_amount: number;
          failed_amount: number;
          refunded_amount: number;
          net_collected_amount: number;
          payments_count: number;
          captured_payments_count: number;
          failed_payments_count: number;
          payment_success_rate: number;
        }>;
      };
      analytics_payments_status_breakdown: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          status: string;
          payments_count: number;
          total_amount: number;
        }>;
      };
      analytics_checkout_funnel: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          stage: string;
          stage_order: number;
          sessions_count: number;
          conversion_rate: number;
        }>;
      };
      analytics_checkout_timeseries: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_bucket?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          bucket_date: string;
          opened_count: number;
          completed_count: number;
          completion_rate: number;
          completed_amount: number;
        }>;
      };
      analytics_inventory_overview: {
        Args: Record<string, never>;
        Returns: Array<{
          total_skus: number;
          out_of_stock_skus: number;
          low_stock_skus: number;
          healthy_skus: number;
          total_available_units: number;
          total_reserved_units: number;
        }>;
      };
      analytics_inventory_movements_timeseries: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_bucket?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          bucket_date: string;
          inbound_qty: number;
          outbound_qty: number;
          reservation_qty: number;
          release_qty: number;
          adjustment_qty: number;
        }>;
      };
      analytics_inventory_low_stock: {
        Args: { p_limit?: number | null };
        Returns: Array<{
          product_id: string;
          sku: string;
          title: string;
          quantity_available: number;
          reorder_point: number;
          location_name: string;
        }>;
      };
      analytics_products_top_revenue: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_limit?: number | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          product_id: string;
          sku: string;
          title: string;
          units_sold: number;
          revenue: number;
          orders_count: number;
          avg_unit_price: number;
        }>;
      };
      analytics_products_conversion: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_limit?: number | null;
        };
        Returns: Array<{
          product_id: string;
          sku: string;
          title: string;
          views: number;
          add_to_cart: number;
          sales_count: number;
          view_to_cart_rate: number;
          cart_to_sale_rate: number;
        }>;
      };
      analytics_operations_overview: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
          p_timezone?: string | null;
        };
        Returns: Array<{
          open_inquiries_count: number;
          pending_inquiries_count: number;
          resolved_inquiries_count: number;
          pending_reviews_count: number;
          approved_reviews_count: number;
          avg_rating: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

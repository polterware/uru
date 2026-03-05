export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      roles: {
        Row: {
          id: string
          code: 'admin' | 'operator' | 'analyst'
          name: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          code: 'admin' | 'operator' | 'analyst'
          name: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          name?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          role_id?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      modules: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          enabled: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          name?: string
          description?: string | null
          enabled?: boolean
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          title: string
          description: string | null
          category_id: string | null
          brand_id: string | null
          price: number
          cost: number | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          sku: string
          title: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          price: number
          cost?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          sku?: string
          title?: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          price?: number
          cost?: number | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          name?: string
          slug?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          name?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          full_name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      customer_addresses: {
        Row: {
          id: string
          customer_id: string
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          customer_id: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      customer_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          name?: string
          description?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      customer_group_memberships: {
        Row: {
          id: string
          customer_id: string
          customer_group_id: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          customer_id: string
          customer_group_id: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          customer_group_id?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      locations: {
        Row: {
          id: string
          code: string
          name: string
          type: 'warehouse' | 'store' | 'transit'
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          code: string
          name: string
          type?: 'warehouse' | 'store' | 'transit'
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          code?: string
          name?: string
          type?: 'warehouse' | 'store' | 'transit'
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      inventory_levels: {
        Row: {
          id: string
          product_id: string
          location_id: string
          quantity_on_hand: number
          quantity_reserved: number
          quantity_available: number
          reorder_point: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          product_id: string
          location_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          quantity_available?: number
          reorder_point?: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          quantity_on_hand?: number
          quantity_reserved?: number
          quantity_available?: number
          reorder_point?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      inventory_movements: {
        Row: {
          id: string
          inventory_level_id: string
          movement_type: 'inbound' | 'outbound' | 'adjustment' | 'reservation' | 'release'
          quantity: number
          reason: string | null
          reference_type: string | null
          reference_id: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          inventory_level_id: string
          movement_type: 'inbound' | 'outbound' | 'adjustment' | 'reservation' | 'release'
          quantity: number
          reason?: string | null
          reference_type?: string | null
          reference_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          reason?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      checkouts: {
        Row: {
          id: string
          token: string
          customer_id: string | null
          status: 'open' | 'completed' | 'expired' | 'abandoned'
          total_amount: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          token: string
          customer_id?: string | null
          status?: 'open' | 'completed' | 'expired' | 'abandoned'
          total_amount?: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          customer_id?: string | null
          status?: 'open' | 'completed' | 'expired' | 'abandoned'
          total_amount?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          checkout_id: string | null
          status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded' | 'partially_refunded'
          fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
          subtotal_amount: number
          discount_amount: number
          tax_amount: number
          shipping_amount: number
          total_amount: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          checkout_id?: string | null
          status?: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'partially_refunded'
          fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
          subtotal_amount?: number
          discount_amount?: number
          tax_amount?: number
          shipping_amount?: number
          total_amount?: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          customer_id?: string | null
          checkout_id?: string | null
          status?: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'partially_refunded'
          fulfillment_status?: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled'
          subtotal_amount?: number
          discount_amount?: number
          tax_amount?: number
          shipping_amount?: number
          total_amount?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          quantity?: number
          unit_price?: number
          line_total?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      transactions: {
        Row: {
          id: string
          order_id: string | null
          checkout_id: string | null
          status: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          total_amount: number
          currency: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          order_id?: string | null
          checkout_id?: string | null
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          total_amount: number
          currency?: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          order_id?: string | null
          checkout_id?: string | null
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          total_amount?: number
          currency?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          kind: 'product' | 'shipping' | 'discount' | 'tax' | 'fee'
          reference_id: string | null
          amount: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          transaction_id: string
          kind: 'product' | 'shipping' | 'discount' | 'tax' | 'fee'
          reference_id?: string | null
          amount: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          reference_id?: string | null
          amount?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string | null
          transaction_id: string | null
          method: string
          status: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          amount: number
          currency: string
          provider_reference: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          order_id?: string | null
          transaction_id?: string | null
          method: string
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          amount: number
          currency?: string
          provider_reference?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          method?: string
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded'
          amount?: number
          currency?: string
          provider_reference?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      refunds: {
        Row: {
          id: string
          payment_id: string
          order_id: string
          status: 'pending' | 'approved' | 'rejected' | 'processed'
          amount: number
          reason: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          payment_id: string
          order_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'processed'
          amount: number
          reason?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'processed'
          amount?: number
          reason?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      shipments: {
        Row: {
          id: string
          order_id: string
          status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          carrier: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          order_id: string
          status?: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          carrier?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          status?: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          carrier?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      shipment_items: {
        Row: {
          id: string
          shipment_id: string
          order_item_id: string
          quantity: number
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          shipment_id: string
          order_item_id: string
          quantity: number
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          quantity?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      shipment_events: {
        Row: {
          id: string
          shipment_id: string
          event_type: string
          payload: Json
          occurred_at: string
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          shipment_id: string
          event_type: string
          payload?: Json
          occurred_at?: string
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          event_type?: string
          payload?: Json
          occurred_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      inquiries: {
        Row: {
          id: string
          customer_id: string | null
          product_id: string | null
          subject: string
          status: 'open' | 'pending' | 'resolved' | 'closed'
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          customer_id?: string | null
          product_id?: string | null
          subject: string
          status?: 'open' | 'pending' | 'resolved' | 'closed'
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          subject?: string
          status?: 'open' | 'pending' | 'resolved' | 'closed'
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      inquiry_messages: {
        Row: {
          id: string
          inquiry_id: string
          author_id: string
          message: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          inquiry_id: string
          author_id: string
          message: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          message?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string | null
          rating: number
          title: string | null
          body: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          product_id: string
          customer_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          rating?: number
          title?: string | null
          body?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      product_metrics: {
        Row: {
          id: string
          product_id: string
          metric_date: string
          views: number
          add_to_cart: number
          sales_count: number
          revenue_amount: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          product_id: string
          metric_date: string
          views?: number
          add_to_cart?: number
          sales_count?: number
          revenue_amount?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          views?: number
          add_to_cart?: number
          sales_count?: number
          revenue_amount?: number
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
      pos_sessions: {
        Row: {
          id: string
          opened_by: string
          opened_at: string
          closed_at: string | null
          opening_amount: number
          closing_amount: number | null
          status: 'open' | 'closed'
          created_at: string
          updated_at: string
          deleted_at: string | null
          lifecycle_status: 'active' | 'inactive' | 'archived'
        }
        Insert: {
          id?: string
          opened_by: string
          opened_at?: string
          closed_at?: string | null
          opening_amount?: number
          closing_amount?: number | null
          status?: 'open' | 'closed'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
        Update: {
          closed_at?: string | null
          opening_amount?: number
          closing_amount?: number | null
          status?: 'open' | 'closed'
          updated_at?: string
          deleted_at?: string | null
          lifecycle_status?: 'active' | 'inactive' | 'archived'
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      reserve_inventory_stock: {
        Args: { p_product_id: string; p_location_id: string; p_quantity: number; p_reason?: string | null }
        Returns: { inventory_level_id: string; quantity_reserved: number }
      }
      release_inventory_stock: {
        Args: { p_product_id: string; p_location_id: string; p_quantity: number; p_reason?: string | null }
        Returns: { inventory_level_id: string; quantity_available: number }
      }
      finalize_sale: {
        Args: { p_checkout_id: string }
        Returns: { order_id: string; transaction_id: string; payment_id: string }
      }
      create_order_with_items: {
        Args: { p_customer_id?: string | null; p_items: Json }
        Returns: { order_id: string; order_number: string }
      }
      cancel_order_with_restock: {
        Args: { p_order_id: string; p_reason?: string | null }
        Returns: { order_id: string; status: string }
      }
      request_refund: {
        Args: { p_payment_id: string; p_amount: number; p_reason?: string | null }
        Returns: { refund_id: string; status: string }
      }
      update_order_status: {
        Args: { p_order_id: string; p_status: string; p_payment_status?: string | null; p_fulfillment_status?: string | null }
        Returns: { order_id: string; status: string }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

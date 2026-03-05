import type { Order } from '@/types/domain'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export const OrdersRepository = {
  async list(): Promise<Array<Order>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return data as Array<Order>
  },

  async finalizeSale(checkoutId: string): Promise<unknown> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('finalize_sale', {
      p_checkout_id: checkoutId,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },

  async updateStatus(orderId: string, status: string, paymentStatus?: string, fulfillmentStatus?: string): Promise<unknown> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_payment_status: paymentStatus ?? null,
      p_fulfillment_status: fulfillmentStatus ?? null,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },
}

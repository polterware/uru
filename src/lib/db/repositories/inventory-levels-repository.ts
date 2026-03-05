import type { InventoryLevel } from '@/types/domain'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export const InventoryLevelsRepository = {
  async list(): Promise<Array<InventoryLevel>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase
      .from('inventory_levels')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return data as Array<InventoryLevel>
  },

  async reserveStock(productId: string, locationId: string, quantity: number, reason?: string): Promise<unknown> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('reserve_inventory_stock', {
      p_product_id: productId,
      p_location_id: locationId,
      p_quantity: quantity,
      p_reason: reason ?? null,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },

  async releaseStock(productId: string, locationId: string, quantity: number, reason?: string): Promise<unknown> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('release_inventory_stock', {
      p_product_id: productId,
      p_location_id: locationId,
      p_quantity: quantity,
      p_reason: reason ?? null,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },
}

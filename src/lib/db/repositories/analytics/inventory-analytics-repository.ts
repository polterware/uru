import type { AnalyticsRange, InventoryLowStockRow, InventoryMovementsTimeseriesRow, InventoryOverviewRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

const EMPTY_INVENTORY_OVERVIEW: InventoryOverviewRow = {
  total_skus: 0,
  out_of_stock_skus: 0,
  low_stock_skus: 0,
  healthy_skus: 0,
  total_available_units: 0,
  total_reserved_units: 0,
}

export const InventoryAnalyticsRepository = {
  async getOverview(): Promise<InventoryOverviewRow> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_inventory_overview')

    if (error) {
      handleSupabaseError(error)
    }

    const rows = (data ?? []) as Array<InventoryOverviewRow>
    return rows[0] ?? EMPTY_INVENTORY_OVERVIEW
  },

  async getMovementsTimeseries(range: AnalyticsRange): Promise<Array<InventoryMovementsTimeseriesRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_inventory_movements_timeseries', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_bucket: range.bucket,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<InventoryMovementsTimeseriesRow>
  },

  async getLowStock(limit = 10): Promise<Array<InventoryLowStockRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_inventory_low_stock', {
      p_limit: limit,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<InventoryLowStockRow>
  },
}

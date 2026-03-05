import type { AnalyticsRange, ProductsConversionRow, ProductsTopRevenueRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export const ProductsAnalyticsRepository = {
  async getTopRevenue(range: AnalyticsRange, limit = 10): Promise<Array<ProductsTopRevenueRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_products_top_revenue', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_limit: limit,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<ProductsTopRevenueRow>
  },

  async getConversion(range: AnalyticsRange, limit = 10): Promise<Array<ProductsConversionRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_products_conversion', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_limit: limit,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<ProductsConversionRow>
  },
}

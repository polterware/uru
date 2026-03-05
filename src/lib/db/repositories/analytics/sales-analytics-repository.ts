import type { AnalyticsRange, OrdersStatusBreakdownRow, SalesOverviewRow, SalesTimeseriesRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

const EMPTY_SALES_OVERVIEW: SalesOverviewRow = {
  gross_sales: 0,
  paid_sales: 0,
  refunded_amount: 0,
  net_sales: 0,
  orders_count: 0,
  paid_orders_count: 0,
  avg_ticket: 0,
  cancelled_orders_count: 0,
  cancellation_rate: 0,
}

export const SalesAnalyticsRepository = {
  async getOverview(range: AnalyticsRange): Promise<SalesOverviewRow> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_sales_overview', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    const rows = (data ?? []) as Array<SalesOverviewRow>
    return rows[0] ?? EMPTY_SALES_OVERVIEW
  },

  async getTimeseries(range: AnalyticsRange): Promise<Array<SalesTimeseriesRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_sales_timeseries', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_bucket: range.bucket,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<SalesTimeseriesRow>
  },

  async getStatusBreakdown(range: AnalyticsRange): Promise<Array<OrdersStatusBreakdownRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_orders_status_breakdown', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<OrdersStatusBreakdownRow>
  },
}

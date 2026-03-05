import type { AnalyticsRange, CheckoutFunnelRow, CheckoutTimeseriesRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export const CheckoutAnalyticsRepository = {
  async getFunnel(range: AnalyticsRange): Promise<Array<CheckoutFunnelRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_checkout_funnel', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<CheckoutFunnelRow>
  },

  async getTimeseries(range: AnalyticsRange): Promise<Array<CheckoutTimeseriesRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_checkout_timeseries', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_bucket: range.bucket,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<CheckoutTimeseriesRow>
  },
}

import type { AnalyticsRange, PaymentsOverviewRow, PaymentsStatusBreakdownRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

const EMPTY_PAYMENTS_OVERVIEW: PaymentsOverviewRow = {
  captured_amount: 0,
  pending_amount: 0,
  failed_amount: 0,
  refunded_amount: 0,
  net_collected_amount: 0,
  payments_count: 0,
  captured_payments_count: 0,
  failed_payments_count: 0,
  payment_success_rate: 0,
}

export const PaymentsAnalyticsRepository = {
  async getOverview(range: AnalyticsRange): Promise<PaymentsOverviewRow> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_payments_overview', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    const rows = (data ?? []) as Array<PaymentsOverviewRow>
    return rows[0] ?? EMPTY_PAYMENTS_OVERVIEW
  },

  async getStatusBreakdown(range: AnalyticsRange): Promise<Array<PaymentsStatusBreakdownRow>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_payments_status_breakdown', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    return (data ?? []) as Array<PaymentsStatusBreakdownRow>
  },
}

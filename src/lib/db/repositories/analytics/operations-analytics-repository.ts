import type { AnalyticsRange, OperationsOverviewRow } from '@/types/analytics'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

const EMPTY_OPERATIONS_OVERVIEW: OperationsOverviewRow = {
  open_inquiries_count: 0,
  pending_inquiries_count: 0,
  resolved_inquiries_count: 0,
  pending_reviews_count: 0,
  approved_reviews_count: 0,
  avg_rating: 0,
}

export const OperationsAnalyticsRepository = {
  async getOverview(range: AnalyticsRange): Promise<OperationsOverviewRow> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.rpc('analytics_operations_overview', {
      p_start_date: range.startDate,
      p_end_date: range.endDate,
      p_timezone: range.timezone,
    })

    if (error) {
      handleSupabaseError(error)
    }

    const rows = (data ?? []) as Array<OperationsOverviewRow>
    return rows[0] ?? EMPTY_OPERATIONS_OVERVIEW
  },
}

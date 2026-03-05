export type AnalyticsRangeKey = '7d' | '30d' | '90d' | 'all'

export type AnalyticsBucket = 'day' | 'month'

export type AnalyticsRangeOption = {
  key: AnalyticsRangeKey
  label: string
}

export type AnalyticsRange = {
  key: AnalyticsRangeKey
  startDate: string | null
  endDate: string | null
  bucket: AnalyticsBucket
  timezone: string
  label: string
}

export type SalesOverviewRow = {
  gross_sales: number
  paid_sales: number
  refunded_amount: number
  net_sales: number
  orders_count: number
  paid_orders_count: number
  avg_ticket: number
  cancelled_orders_count: number
  cancellation_rate: number
}

export type SalesTimeseriesRow = {
  bucket_date: string
  gross_sales: number
  paid_sales: number
  refunded_amount: number
  net_sales: number
  orders_count: number
}

export type OrdersStatusBreakdownRow = {
  status: string
  orders_count: number
  total_amount: number
}

export type PaymentsOverviewRow = {
  captured_amount: number
  pending_amount: number
  failed_amount: number
  refunded_amount: number
  net_collected_amount: number
  payments_count: number
  captured_payments_count: number
  failed_payments_count: number
  payment_success_rate: number
}

export type PaymentsStatusBreakdownRow = {
  status: string
  payments_count: number
  total_amount: number
}

export type CheckoutFunnelRow = {
  stage: string
  stage_order: number
  sessions_count: number
  conversion_rate: number
}

export type CheckoutTimeseriesRow = {
  bucket_date: string
  opened_count: number
  completed_count: number
  completion_rate: number
  completed_amount: number
}

export type InventoryOverviewRow = {
  total_skus: number
  out_of_stock_skus: number
  low_stock_skus: number
  healthy_skus: number
  total_available_units: number
  total_reserved_units: number
}

export type InventoryMovementsTimeseriesRow = {
  bucket_date: string
  inbound_qty: number
  outbound_qty: number
  reservation_qty: number
  release_qty: number
  adjustment_qty: number
}

export type InventoryLowStockRow = {
  product_id: string
  sku: string
  title: string
  quantity_available: number
  reorder_point: number
  location_name: string
}

export type ProductsTopRevenueRow = {
  product_id: string
  sku: string
  title: string
  units_sold: number
  revenue: number
  orders_count: number
  avg_unit_price: number
}

export type ProductsConversionRow = {
  product_id: string
  sku: string
  title: string
  views: number
  add_to_cart: number
  sales_count: number
  view_to_cart_rate: number
  cart_to_sale_rate: number
}

export type OperationsOverviewRow = {
  open_inquiries_count: number
  pending_inquiries_count: number
  resolved_inquiries_count: number
  pending_reviews_count: number
  approved_reviews_count: number
  avg_rating: number
}

export type SalesAnalyticsData = {
  overview: SalesOverviewRow
  timeseries: Array<SalesTimeseriesRow>
  statusBreakdown: Array<OrdersStatusBreakdownRow>
}

export type PaymentsAnalyticsData = {
  overview: PaymentsOverviewRow
  statusBreakdown: Array<PaymentsStatusBreakdownRow>
}

export type CheckoutAnalyticsData = {
  funnel: Array<CheckoutFunnelRow>
  timeseries: Array<CheckoutTimeseriesRow>
}

export type InventoryAnalyticsData = {
  overview: InventoryOverviewRow
  movementsTimeseries: Array<InventoryMovementsTimeseriesRow>
  lowStock: Array<InventoryLowStockRow>
}

export type ProductsAnalyticsData = {
  topRevenue: Array<ProductsTopRevenueRow>
  conversion: Array<ProductsConversionRow>
}

export type OperationsAnalyticsData = {
  overview: OperationsOverviewRow
}

export type AnalyticsDomainResult<T> = {
  data: T
  error: string | null
}

export type AnalyticsDashboardData = {
  range: AnalyticsRange
  sales: AnalyticsDomainResult<SalesAnalyticsData>
  payments: AnalyticsDomainResult<PaymentsAnalyticsData>
  checkout: AnalyticsDomainResult<CheckoutAnalyticsData>
  inventory: AnalyticsDomainResult<InventoryAnalyticsData>
  products: AnalyticsDomainResult<ProductsAnalyticsData>
  operations: AnalyticsDomainResult<OperationsAnalyticsData>
}

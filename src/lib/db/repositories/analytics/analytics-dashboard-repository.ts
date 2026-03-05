import { resolveAnalyticsRange } from '@/lib/analytics/analytics-range'
import type {
  AnalyticsDashboardData,
  AnalyticsDomainResult,
  AnalyticsRangeKey,
  CheckoutAnalyticsData,
  InventoryAnalyticsData,
  OperationsAnalyticsData,
  PaymentsAnalyticsData,
  ProductsAnalyticsData,
  SalesAnalyticsData,
} from '@/types/analytics'
import { CheckoutAnalyticsRepository } from './checkout-analytics-repository'
import { InventoryAnalyticsRepository } from './inventory-analytics-repository'
import { OperationsAnalyticsRepository } from './operations-analytics-repository'
import { PaymentsAnalyticsRepository } from './payments-analytics-repository'
import { ProductsAnalyticsRepository } from './products-analytics-repository'
import { SalesAnalyticsRepository } from './sales-analytics-repository'

const EMPTY_SALES_DATA: SalesAnalyticsData = {
  overview: {
    gross_sales: 0,
    paid_sales: 0,
    refunded_amount: 0,
    net_sales: 0,
    orders_count: 0,
    paid_orders_count: 0,
    avg_ticket: 0,
    cancelled_orders_count: 0,
    cancellation_rate: 0,
  },
  timeseries: [],
  statusBreakdown: [],
}

const EMPTY_PAYMENTS_DATA: PaymentsAnalyticsData = {
  overview: {
    captured_amount: 0,
    pending_amount: 0,
    failed_amount: 0,
    refunded_amount: 0,
    net_collected_amount: 0,
    payments_count: 0,
    captured_payments_count: 0,
    failed_payments_count: 0,
    payment_success_rate: 0,
  },
  statusBreakdown: [],
}

const EMPTY_CHECKOUT_DATA: CheckoutAnalyticsData = {
  funnel: [],
  timeseries: [],
}

const EMPTY_INVENTORY_DATA: InventoryAnalyticsData = {
  overview: {
    total_skus: 0,
    out_of_stock_skus: 0,
    low_stock_skus: 0,
    healthy_skus: 0,
    total_available_units: 0,
    total_reserved_units: 0,
  },
  movementsTimeseries: [],
  lowStock: [],
}

const EMPTY_PRODUCTS_DATA: ProductsAnalyticsData = {
  topRevenue: [],
  conversion: [],
}

const EMPTY_OPERATIONS_DATA: OperationsAnalyticsData = {
  overview: {
    open_inquiries_count: 0,
    pending_inquiries_count: 0,
    resolved_inquiries_count: 0,
    pending_reviews_count: 0,
    approved_reviews_count: 0,
    avg_rating: 0,
  },
}

function toDomainResult<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
): AnalyticsDomainResult<T> {
  if (result.status === 'fulfilled') {
    return {
      data: result.value,
      error: null,
    }
  }

  const message = result.reason instanceof Error ? result.reason.message : 'Erro ao carregar domínio de analytics'

  return {
    data: fallback,
    error: message,
  }
}

export const AnalyticsDashboardRepository = {
  async loadDashboard(rangeKey: AnalyticsRangeKey): Promise<AnalyticsDashboardData> {
    const range = resolveAnalyticsRange(rangeKey)

    const salesPromise = Promise.all([
      SalesAnalyticsRepository.getOverview(range),
      SalesAnalyticsRepository.getTimeseries(range),
      SalesAnalyticsRepository.getStatusBreakdown(range),
    ]).then(([overview, timeseries, statusBreakdown]) => ({
      overview,
      timeseries,
      statusBreakdown,
    }))

    const paymentsPromise = Promise.all([
      PaymentsAnalyticsRepository.getOverview(range),
      PaymentsAnalyticsRepository.getStatusBreakdown(range),
    ]).then(([overview, statusBreakdown]) => ({
      overview,
      statusBreakdown,
    }))

    const checkoutPromise = Promise.all([
      CheckoutAnalyticsRepository.getFunnel(range),
      CheckoutAnalyticsRepository.getTimeseries(range),
    ]).then(([funnel, timeseries]) => ({
      funnel,
      timeseries,
    }))

    const inventoryPromise = Promise.all([
      InventoryAnalyticsRepository.getOverview(),
      InventoryAnalyticsRepository.getMovementsTimeseries(range),
      InventoryAnalyticsRepository.getLowStock(10),
    ]).then(([overview, movementsTimeseries, lowStock]) => ({
      overview,
      movementsTimeseries,
      lowStock,
    }))

    const productsPromise = Promise.all([
      ProductsAnalyticsRepository.getTopRevenue(range, 10),
      ProductsAnalyticsRepository.getConversion(range, 10),
    ]).then(([topRevenue, conversion]) => ({
      topRevenue,
      conversion,
    }))

    const operationsPromise = OperationsAnalyticsRepository.getOverview(range).then((overview) => ({ overview }))

    const [
      salesResult,
      paymentsResult,
      checkoutResult,
      inventoryResult,
      productsResult,
      operationsResult,
    ] = await Promise.allSettled([
      salesPromise,
      paymentsPromise,
      checkoutPromise,
      inventoryPromise,
      productsPromise,
      operationsPromise,
    ])

    return {
      range,
      sales: toDomainResult(salesResult, EMPTY_SALES_DATA),
      payments: toDomainResult(paymentsResult, EMPTY_PAYMENTS_DATA),
      checkout: toDomainResult(checkoutResult, EMPTY_CHECKOUT_DATA),
      inventory: toDomainResult(inventoryResult, EMPTY_INVENTORY_DATA),
      products: toDomainResult(productsResult, EMPTY_PRODUCTS_DATA),
      operations: toDomainResult(operationsResult, EMPTY_OPERATIONS_DATA),
    }
  },
}

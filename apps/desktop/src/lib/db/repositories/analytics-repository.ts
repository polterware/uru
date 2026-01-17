import { invoke } from "@tauri-apps/api/core"

export type DashboardStats = {
  totalItems: number
  lowStockItems: number
  totalInventoryValue: number
  totalItemsGrowth: number
}

export type DailyMovementStat = {
  date: string
  stockIn: number
  stockOut: number
}

type StockMovementsFilter = {
  timeRange: string
}

export const AnalyticsRepository = {
  async getDashboardStats(): Promise<DashboardStats> {
    return invoke("get_dashboard_stats")
  },
  async getStockMovements(timeRange: string): Promise<DailyMovementStat[]> {
    const payload: StockMovementsFilter = { timeRange }
    return invoke("get_stock_movements", { payload })
  },
}

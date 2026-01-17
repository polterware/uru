import { Activity, Box, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { ChartConfig } from "@/components/ui/chart"
import type { DailyMovementStat, DashboardStats } from "@/lib/db/repositories/analytics-repository"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnalyticsRepository } from "@/lib/db/repositories/analytics-repository"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ChartAreaInteractive } from "@/components/charts/area-chart"
import { ChartLineInteractive } from "@/components/charts/line-chart"
import { ChartBarInteractive } from "@/components/charts/bar-chart"
import { ChartPieLabel } from "@/components/charts/pie-chart"
import { ChartRadarDots } from "@/components/charts/radar-chart"
import { ChartRadialText } from "@/components/charts/radial-chart"
import { ChartTooltipAdvanced } from "@/components/charts/tooltips"

export const Route = createFileRoute("/")({ component: Dashboard })

const chartConfig = {
  views: {
    label: "Movements",
  },
  stockIn: {
    label: "Stock In",
    color: "var(--chart-1)",
  },
  stockOut: {
    label: "Stock Out",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function Dashboard() {
  const [activeChart, setActiveChart] = useLocalStorage<keyof typeof chartConfig>("dashboard_activeChart", "stockIn")
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [chartData, setChartData] = React.useState<Array<DailyMovementStat>>([])
  const [timeRange, setTimeRange] = useLocalStorage("dashboard_timeRange", "30d")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, dailyMovements] = await Promise.all([
          AnalyticsRepository.getDashboardStats(),
          AnalyticsRepository.getStockMovements(timeRange)
        ])
        setStats(dashboardStats)
        setChartData(dailyMovements)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeRange])

  const total = React.useMemo(
    () => ({
      stockIn: chartData.reduce((acc, curr) => acc + curr.stockIn, 0),
      stockOut: chartData.reduce((acc, curr) => acc + curr.stockOut, 0),
    }),
    [chartData]
  )

  if (loading) {
    return <div className="p-4">Loading stats...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-3 md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {stats?.totalItemsGrowth ?? 0}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalItems ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                From last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <Box className="h-3 w-3" />
                Needs Attention
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.lowStockItems ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Items below safety stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Asset Value
              </CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <Activity className="h-3 w-3" />
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total inventory cost
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
        <ChartAreaInteractive  />
        <ChartLineInteractive />
        <ChartBarInteractive />
        <div className="grid gap-4 md:grid-cols-3">
            <ChartPieLabel />
            <ChartRadarDots />
            <ChartRadialText />
        </div>
        <ChartTooltipAdvanced />
    </div>
  )
}

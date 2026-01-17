import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type OrderRow = {
  id: string
  order_number: string
  status: string
  payment_status: string
  fulfillment_status: string
  customer_id?: string | null
  shop_id?: string | null
  subtotal_price?: number | null
  total_price?: number | null
  created_at?: string | null
}

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("order_number"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => row.getValue("payment_status") || "-",
  },
  {
    accessorKey: "fulfillment_status",
    header: "Fulfillment",
    cell: ({ row }) => row.getValue("fulfillment_status") || "-",
  },
  {
    accessorKey: "customer_id",
    header: "Customer",
    cell: ({ row }) => row.getValue("customer_id") || "-",
  },
  {
    accessorKey: "shop_id",
    header: "Shop",
    cell: ({ row }) => row.getValue("shop_id") || "-",
  },
  {
    accessorKey: "subtotal_price",
    header: "Subtotal",
    cell: ({ row }) => formatCurrency(row.getValue("subtotal_price")),
  },
  {
    accessorKey: "total_price",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.getValue("total_price")),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function OrdersTable() {
  const data = React.useMemo<OrderRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="order_number"
      filterPlaceholder="Filter orders..."
      emptyMessage="No orders found."
    />
  )
}

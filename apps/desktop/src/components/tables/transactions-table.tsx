import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type TransactionRow = {
  id: string
  type: string
  status: string
  channel?: string | null
  customer_id?: string | null
  staff_id?: string | null
  total_net?: number | null
  total_items?: number | null
  total_discount?: number | null
  total_shipping?: number | null
  created_at?: string | null
}

const columns: ColumnDef<TransactionRow>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("type") || "-"}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => row.getValue("channel") || "-",
  },
  {
    accessorKey: "customer_id",
    header: "Customer",
    cell: ({ row }) => row.getValue("customer_id") || "-",
  },
  {
    accessorKey: "staff_id",
    header: "Staff",
    cell: ({ row }) => row.getValue("staff_id") || "-",
  },
  {
    accessorKey: "total_net",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Net
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("total_net")),
  },
  {
    accessorKey: "total_items",
    header: "Items",
    cell: ({ row }) => row.getValue("total_items") ?? "-",
  },
  {
    accessorKey: "total_discount",
    header: "Discount",
    cell: ({ row }) => formatCurrency(row.getValue("total_discount")),
  },
  {
    accessorKey: "total_shipping",
    header: "Shipping",
    cell: ({ row }) => formatCurrency(row.getValue("total_shipping")),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function TransactionsTable() {
  const data = React.useMemo<TransactionRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="customer_id"
      filterPlaceholder="Filter transactions..."
      emptyMessage="No transactions found."
      action={{ label: "New Transaction", to: "/transactions/new" }}
    />
  )
}

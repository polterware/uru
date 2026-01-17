import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type CheckoutRow = {
  id: string
  token: string
  status: string
  email?: string | null
  user_id?: string | null
  total_price?: number | null
  created_at?: string | null
}

const columns: ColumnDef<CheckoutRow>[] = [
  {
    accessorKey: "token",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Token
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("token"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || "-",
  },
  {
    accessorKey: "user_id",
    header: "User",
    cell: ({ row }) => row.getValue("user_id") || "-",
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

export function CheckoutsTable() {
  const data = React.useMemo<CheckoutRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="email"
      filterPlaceholder="Filter checkouts..."
      emptyMessage="No checkouts found."
    />
  )
}

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type RefundRow = {
  id: string
  payment_id: string
  amount: number
  status: string
  reason?: string | null
  created_at?: string | null
}

const columns: ColumnDef<RefundRow>[] = [
  {
    accessorKey: "payment_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payment
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("payment_id"),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => row.getValue("reason") || "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function RefundsTable() {
  const data = React.useMemo<RefundRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="payment_id"
      filterPlaceholder="Filter refunds..."
      emptyMessage="No refunds found."
    />
  )
}

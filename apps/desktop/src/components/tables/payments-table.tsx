import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type PaymentRow = {
  id: string
  transaction_id: string
  amount: number
  currency?: string | null
  provider: string
  method: string
  status: string
  created_at?: string | null
}

const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: "transaction_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transaction
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("transaction_id"),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => row.getValue("currency") || "BRL",
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => row.getValue("provider"),
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => row.getValue("method"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function PaymentsTable() {
  const data = React.useMemo<PaymentRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="transaction_id"
      filterPlaceholder="Filter payments..."
      emptyMessage="No payments found."
    />
  )
}

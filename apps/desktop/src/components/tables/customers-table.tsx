import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type CustomerRow = {
  id: string
  type: string
  email?: string | null
  phone?: string | null
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  status: string
  orders_count?: number | null
  total_spent?: number | null
  last_order_at?: string | null
  created_at?: string | null
}

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("type") || "-"}</Badge>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("email") || "-",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => row.getValue("first_name") || "-",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => row.getValue("last_name") || "-",
  },
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => row.getValue("company_name") || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "orders_count",
    header: "Orders",
    cell: ({ row }) => row.getValue("orders_count") ?? "-",
  },
  {
    accessorKey: "total_spent",
    header: "Total Spent",
    cell: ({ row }) => formatCurrency(row.getValue("total_spent")),
  },
  {
    accessorKey: "last_order_at",
    header: "Last Order",
    cell: ({ row }) => formatDateTime(row.getValue("last_order_at")),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function CustomersTable() {
  const data = React.useMemo<CustomerRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="email"
      filterPlaceholder="Filter customers..."
      emptyMessage="No customers found."
    />
  )
}

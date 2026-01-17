import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"

type MovementRow = {
  id: string
  type: "in" | "out"
  quantity: number
  inventory_level_id: string
  previous_balance?: number | null
  new_balance?: number | null
  created_at?: string | null
}

const columns: ColumnDef<MovementRow>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.getValue("type") === "in" ? "secondary" : "destructive"}>
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("quantity"),
  },
  {
    accessorKey: "inventory_level_id",
    header: "Inventory Level",
    cell: ({ row }) => row.getValue("inventory_level_id"),
  },
  {
    accessorKey: "previous_balance",
    header: "Previous",
    cell: ({ row }) => row.getValue("previous_balance") ?? "-",
  },
  {
    accessorKey: "new_balance",
    header: "New",
    cell: ({ row }) => row.getValue("new_balance") ?? "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function MovementsTable() {
  const data = React.useMemo<MovementRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="inventory_level_id"
      filterPlaceholder="Filter movements..."
      emptyMessage="No movements found."
    />
  )
}

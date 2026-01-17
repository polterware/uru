import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"

type InventoryRow = {
  id: string
  product_id: string
  location_id: string
  quantity_on_hand: number
  quantity_reserved: number
  stock_status?: string | null
  batch_number?: string | null
  serial_number?: string | null
  expiry_date?: string | null
  last_counted_at?: string | null
}

const columns: ColumnDef<InventoryRow>[] = [
  {
    accessorKey: "product_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("product_id"),
  },
  {
    accessorKey: "location_id",
    header: "Location",
    cell: ({ row }) => row.getValue("location_id"),
  },
  {
    accessorKey: "quantity_on_hand",
    header: "On Hand",
    cell: ({ row }) => row.getValue("quantity_on_hand"),
  },
  {
    accessorKey: "quantity_reserved",
    header: "Reserved",
    cell: ({ row }) => row.getValue("quantity_reserved"),
  },
  {
    accessorKey: "stock_status",
    header: "Stock Status",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("stock_status") || "-"}</Badge>
    ),
  },
  {
    accessorKey: "batch_number",
    header: "Batch",
    cell: ({ row }) => row.getValue("batch_number") || "-",
  },
  {
    accessorKey: "serial_number",
    header: "Serial",
    cell: ({ row }) => row.getValue("serial_number") || "-",
  },
  {
    accessorKey: "expiry_date",
    header: "Expiry",
    cell: ({ row }) => formatDateTime(row.getValue("expiry_date")),
  },
  {
    accessorKey: "last_counted_at",
    header: "Last Counted",
    cell: ({ row }) => formatDateTime(row.getValue("last_counted_at")),
  },
]

export function InventoryTable() {
  const data = React.useMemo<InventoryRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="product_id"
      filterPlaceholder="Filter inventory..."
      emptyMessage="No inventory levels found."
      action={{ label: "Add Movement", to: "/movements" }}
    />
  )
}

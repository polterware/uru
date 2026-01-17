import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type ProductRow = {
  id: string
  sku: string
  name: string
  type: string
  status: string
  price: number
  promotional_price?: number | null
  brand_id?: string | null
  category_id?: string | null
  is_shippable?: boolean | null
  stock_status?: string | null
  created_at?: string | null
}

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        SKU
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="uppercase">{row.getValue("sku") || "-"}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
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
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "promotional_price",
    header: "Promo Price",
    cell: ({ row }) => formatCurrency(row.getValue("promotional_price")),
  },
  {
    accessorKey: "brand_id",
    header: "Brand",
    cell: ({ row }) => row.getValue("brand_id") || "-",
  },
  {
    accessorKey: "category_id",
    header: "Category",
    cell: ({ row }) => row.getValue("category_id") || "-",
  },
  {
    accessorKey: "is_shippable",
    header: "Shippable",
    cell: ({ row }) => (row.getValue("is_shippable") ? "Yes" : "No"),
  },
  {
    accessorKey: "stock_status",
    header: "Stock Status",
    cell: ({ row }) => row.getValue("stock_status") || "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function ProductsTable() {
  const data = React.useMemo<ProductRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="name"
      filterPlaceholder="Filter products..."
      emptyMessage="No products found."
    />
  )
}

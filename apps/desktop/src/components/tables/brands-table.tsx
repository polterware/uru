import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"

type BrandRow = {
  id: string
  name: string
  slug: string
  status: string
  is_featured: boolean
  sort_order?: number | null
  website_url?: string | null
  created_at?: string | null
}

const columns: ColumnDef<BrandRow>[] = [
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
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => row.getValue("slug"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status") || "-"}</Badge>,
  },
  {
    accessorKey: "is_featured",
    header: "Featured",
    cell: ({ row }) => (row.getValue("is_featured") ? "Yes" : "No"),
  },
  {
    accessorKey: "sort_order",
    header: "Sort",
    cell: ({ row }) => row.getValue("sort_order") ?? "-",
  },
  {
    accessorKey: "website_url",
    header: "Website",
    cell: ({ row }) => row.getValue("website_url") || "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function BrandsTable() {
  const data = React.useMemo<BrandRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="name"
      filterPlaceholder="Filter brands..."
      emptyMessage="No brands found."
    />
  )
}

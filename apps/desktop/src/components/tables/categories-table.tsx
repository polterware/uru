import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"

type CategoryRow = {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  type: string
  is_visible: boolean
  sort_order?: number | null
  created_at?: string | null
}

const columns: ColumnDef<CategoryRow>[] = [
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
    accessorKey: "parent_id",
    header: "Parent",
    cell: ({ row }) => row.getValue("parent_id") || "-",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("type") || "-"}</Badge>,
  },
  {
    accessorKey: "is_visible",
    header: "Visible",
    cell: ({ row }) => (row.getValue("is_visible") ? "Yes" : "No"),
  },
  {
    accessorKey: "sort_order",
    header: "Sort",
    cell: ({ row }) => row.getValue("sort_order") ?? "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => formatDateTime(row.getValue("created_at")),
  },
]

export function CategoriesTable() {
  const data = React.useMemo<CategoryRow[]>(() => [], [])

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="name"
      filterPlaceholder="Filter categories..."
      emptyMessage="No categories found."
    />
  )
}

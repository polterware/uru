import { createFileRoute } from "@tanstack/react-router"

import { CategoriesTable } from "@/components/tables/categories-table"

export const Route = createFileRoute("/categories/")({
  component: CategoriesRoute,
})

function CategoriesRoute() {
  return <CategoriesTable />
}

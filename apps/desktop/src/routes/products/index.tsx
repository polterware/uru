import { createFileRoute } from "@tanstack/react-router"

import { ProductsTable } from "@/components/tables/products-table"

export const Route = createFileRoute("/products/")({
  component: ProductsRoute,
})

function ProductsRoute() {
  return <ProductsTable />
}

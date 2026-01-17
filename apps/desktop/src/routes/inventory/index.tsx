import { createFileRoute } from "@tanstack/react-router"

import { InventoryTable } from "@/components/tables/inventory-table"
export const Route = createFileRoute("/inventory/")({
  component: InventoryRoute,
})

function InventoryRoute() {
  return <InventoryTable />
}

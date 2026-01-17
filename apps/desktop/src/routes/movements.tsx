import { createFileRoute } from "@tanstack/react-router"

import { MovementsTable } from "@/components/tables/movements-table"

export const Route = createFileRoute("/movements")({
  component: MovementsRoute,
})

function MovementsRoute() {
  return <MovementsTable />
}

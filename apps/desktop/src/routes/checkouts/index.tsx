import { createFileRoute } from "@tanstack/react-router"

import { CheckoutsTable } from "@/components/tables/checkouts-table"

export const Route = createFileRoute("/checkouts/")({
  component: CheckoutsRoute,
})

function CheckoutsRoute() {
  return <CheckoutsTable />
}

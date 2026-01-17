import { createFileRoute } from "@tanstack/react-router"

import { RefundsTable } from "@/components/tables/refunds-table"

export const Route = createFileRoute("/refunds/")({
  component: RefundsRoute,
})

function RefundsRoute() {
  return <RefundsTable />
}

import { createFileRoute } from "@tanstack/react-router"

import { PosSessionsTable } from "@/components/tables/pos-sessions-table"

export const Route = createFileRoute("/shops/$shopId/pos-sessions/")({
  component: PosSessionsRoute,
})

function PosSessionsRoute() {
  return <PosSessionsTable />
}

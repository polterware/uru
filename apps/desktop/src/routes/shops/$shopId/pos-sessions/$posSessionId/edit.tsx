import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/shops/$shopId/pos-sessions/$posSessionId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/shops/$shopId/pos-sessions/$posSessionId/edit"!</div>
}

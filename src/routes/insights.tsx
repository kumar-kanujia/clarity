import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/insights')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/insights"!</div>
}

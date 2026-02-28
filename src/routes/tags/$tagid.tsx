import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/tags/$tagid")({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Tag Page</div>
}

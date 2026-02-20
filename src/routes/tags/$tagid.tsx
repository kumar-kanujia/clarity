import { TagIdView } from "@/features/tags/view/tag-id"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tags/$tagid")({
  component: RouteComponent
})

function RouteComponent() {
  return <TagIdView />
}

import { TagsView } from "@/features/tags/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tags/")({
  component: TagRoute
})

function TagRoute() {
  return <TagsView />
}

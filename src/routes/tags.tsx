import { TagView } from "@/features/tag/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tags")({
  component: TagRoute
})

function TagRoute() {
  return <TagView />
}

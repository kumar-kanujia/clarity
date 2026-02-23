import { getAllTagsQueryOption } from "@/features/tags/hooks"
import { TagsView } from "@/features/tags/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/tags/")({
  component: TagRoute,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getAllTagsQueryOption())
  }
})

function TagRoute() {
  return <TagsView />
}

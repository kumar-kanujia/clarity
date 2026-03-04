import { createFileRoute } from "@tanstack/react-router"

import { TagsView } from "@/features/tags/view"
import {
  getAllTagsQueryOption,
  getInactiveTagsQueryOption
} from "@/features/tags/queries"

export const Route = createFileRoute("/tags/")({
  component: TagRoute,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getAllTagsQueryOption())
    context.queryClient.ensureQueryData(getInactiveTagsQueryOption())
  }
})

function TagRoute() {
  return <TagsView />
}

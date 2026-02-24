import { createFileRoute } from "@tanstack/react-router"

import {
  getAllTagsQueryOption,
  getInactiveTagsQueryOption
} from "@/features/tags/hooks"
import { TagsView } from "@/features/tags/view"

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

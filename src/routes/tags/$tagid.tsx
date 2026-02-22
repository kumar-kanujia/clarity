import { MainImageView } from "@/components/view"
import { getTagGalleryQueryOptions } from "@/features/tags/hooks"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/tags/$tagid")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureInfiniteQueryData(
      getTagGalleryQueryOptions(Number.parseInt(params.tagid))
    )
  }
})

function RouteComponent() {
  const { tagid } = useParams({ from: "/tags/$tagid" })
  const queryOptions = useMemo(
    () => getTagGalleryQueryOptions(Number(tagid)),
    [tagid]
  )
  return <MainImageView queryOptions={queryOptions} />
}

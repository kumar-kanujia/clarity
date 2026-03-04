import { State } from "@/features/common/components/state"
import { getTagImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

export const Route = createFileRoute("/tags/$tagid")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureInfiniteQueryData(
      getTagImageQueryOptions(Number.parseInt(params.tagid))
    )
  },
  errorComponent: () => (
    <State variant="error" message="Something went wrong!" />
  )
})

function RouteComponent() {
  const { tagid } = useParams({ from: "/tags/$tagid" })

  const queryOptions = useMemo(
    () => getTagImageQueryOptions(Number.parseInt(tagid)),
    [tagid]
  )

  return (
    <Suspense fallback={<State variant="loading" />}>
      <ImageGridView queryOptions={queryOptions} mode="tag" />
    </Suspense>
  )
}

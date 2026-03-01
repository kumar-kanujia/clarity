import { StateWithHeader } from "@/features/common/components/state"
import { getUntaggedImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

export const Route = createFileRoute("/untagged")({
  component: UntaggedPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getUntaggedImageQueryOptions())
  },
  errorComponent: () => (
    <StateWithHeader variant="error" message="Something went wrong!" />
  )
})

function UntaggedPage() {
  const queryOptions = useMemo(() => getUntaggedImageQueryOptions(), [])

  return (
    <Suspense fallback={<StateWithHeader variant="loading" />}>
      <ImageGridView queryOptions={queryOptions} />
    </Suspense>
  )
}

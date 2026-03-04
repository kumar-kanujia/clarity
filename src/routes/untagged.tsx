import { StateWithHeader } from "@/features/common/components/state"
import { getUntaggedQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

const untaggedQueryOptions = getUntaggedQueryOptions()

function UntaggedPage() {
  return (
    <Suspense fallback={<StateWithHeader variant="loading" />}>
      <ImageGridView queryOptions={untaggedQueryOptions} />
    </Suspense>
  )
}

export const Route = createFileRoute("/untagged")({
  component: UntaggedPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(untaggedQueryOptions)
  },
  errorComponent: () => (
    <StateWithHeader variant="error" message="Something went wrong!" />
  )
})

import { StateWithHeader } from "@/features/common/components/state"
import { getTrashImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

export const Route = createFileRoute("/trash")({
  component: TrashPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getTrashImageQueryOptions())
  },
  errorComponent: () => (
    <StateWithHeader variant="error" message="Something went wrong!" />
  )
})

function TrashPage() {
  const queryOptions = useMemo(() => getTrashImageQueryOptions(), [])

  return (
    <Suspense fallback={<StateWithHeader variant="loading" />}>
      <ImageGridView queryOptions={queryOptions} />
    </Suspense>
  )
}

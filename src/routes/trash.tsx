import { State } from "@/features/common/components/state"
import { getTrashQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

const trashQueryOptions = getTrashQueryOptions()

function TrashPage() {
  return (
    <Suspense fallback={<State variant="loading" />}>
      <ImageGridView queryOptions={trashQueryOptions} mode="trash" />
    </Suspense>
  )
}

export const Route = createFileRoute("/trash")({
  component: TrashPage,
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(trashQueryOptions),
  errorComponent: () => (
    <State variant="error" message="Something went wrong!" />
  )
})

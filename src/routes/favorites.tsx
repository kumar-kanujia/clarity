import { StateWithHeader } from "@/features/common/components/state"
import { getFavoriteImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getFavoriteImageQueryOptions())
  },
  errorComponent: () => (
    <StateWithHeader variant="error" message="Something went wrong!" />
  )
})

function FavoritesPage() {
  const queryOptions = useMemo(() => getFavoriteImageQueryOptions(), [])
  return (
    <Suspense fallback={<StateWithHeader variant="loading" />}>
      <ImageGridView queryOptions={queryOptions} />
    </Suspense>
  )
}

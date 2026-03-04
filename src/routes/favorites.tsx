import { StateWithHeader } from "@/features/common/components/state"
import { getFavoritesQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

const favoritesQueryOptions = getFavoritesQueryOptions()

function FavoritesPage() {
  return (
    <Suspense fallback={<StateWithHeader variant="loading" />}>
      <ImageGridView queryOptions={favoritesQueryOptions} mode="favorites" />
    </Suspense>
  )
}

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(favoritesQueryOptions)
  },
  errorComponent: () => (
    <StateWithHeader variant="error" message="Something went wrong!" />
  )
})

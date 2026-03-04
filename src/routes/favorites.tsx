import { State } from "@/features/common/components"
import { getFavoritesQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

const favoritesQueryOptions = getFavoritesQueryOptions()

function FavoritesPage() {
  return (
    <Suspense fallback={<State variant="loading" />}>
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
    <State variant="error" message="Something went wrong!" />
  )
})

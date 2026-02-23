import { MainImageView } from "@/components/view"
import { getFavoritesQueryOptions } from "@/features/favorites/hooks"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/favorites")({
  component: Favorites,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getFavoritesQueryOptions())
  }
})

function Favorites() {
  const queryOptions = useMemo(() => getFavoritesQueryOptions(), [])
  return <MainImageView queryOptions={queryOptions} />
}

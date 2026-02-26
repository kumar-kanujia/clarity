import { MainImageView } from "@/components/view"
import { getFavoritesQueryOptions } from "@/features/favorites/hooks"
import { useSelectStore } from "@/store"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"

export const Route = createFileRoute("/favorites")({
  component: Favorites,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getFavoritesQueryOptions())
  }
})

function Favorites() {
  const { reset } = useSelectStore()

  useEffect(() => {
    reset()
  }, [])

  const queryOptions = useMemo(() => getFavoritesQueryOptions(), [])
  return <MainImageView queryOptions={queryOptions} />
}

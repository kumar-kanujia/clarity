import { FavoritesView } from "@/features/favorites/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/favorites")({
  component: Favorites
})

function Favorites() {
  return <FavoritesView />
}

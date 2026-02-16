import { GalleryView } from "@/features/gallery/ui/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index
})

function Index() {
  return <GalleryView />
}

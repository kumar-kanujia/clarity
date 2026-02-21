import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { getGalleryQueryOptions } from "@/features/gallery/hooks"
import { MainImageView } from "@/components/view"

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getGalleryQueryOptions())
  }
})

function HomePage() {
  const queryOptions = useMemo(() => getGalleryQueryOptions(), [])
  return <MainImageView queryOptions={queryOptions} />
}

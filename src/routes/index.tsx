import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"
import { getGalleryQueryOptions } from "@/features/gallery/hooks"
import { MainImageView } from "@/components/view"
import { ErrorBanner, LoadingBanner } from "@/components/common"

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getGalleryQueryOptions())
  },
  errorComponent: ErrorBanner
})

function HomePage() {
  const queryOptions = useMemo(() => getGalleryQueryOptions(), [])
  return (
    <Suspense fallback={<LoadingBanner />}>
      <MainImageView queryOptions={queryOptions} />
    </Suspense>
  )
}

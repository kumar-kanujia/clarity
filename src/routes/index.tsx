import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { getAllImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { State } from "@/features/common/components"
const imageQueryOptions = getAllImageQueryOptions()

function HomePage() {
  return (
    <Suspense fallback={<State variant="loading" />}>
      <ImageGridView queryOptions={imageQueryOptions} />
    </Suspense>
  )
}

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(imageQueryOptions),
  errorComponent: () => (
    <State variant="error" message="Something went wrong!" />
  )
})

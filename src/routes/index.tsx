import { Suspense, useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { getAllImageQueryOptions } from "@/features/images/queries"
import { ImageGridView } from "@/features/images/view"
import { State } from "@/features/common/components/state"

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getAllImageQueryOptions())
  },
  errorComponent: () => (
    <State variant="error" message="Something went wrong!" />
  )
})

function HomePage() {
  const queryOptions = useMemo(() => getAllImageQueryOptions(), [])

  return (
    <Suspense fallback={<State variant="loading" />}>
      <ImageGridView queryOptions={queryOptions} />
    </Suspense>
  )
}

import { MainImageView } from "@/components/view"
import { getBinQueryOptions } from "@/features/bin/hooks"
import { getFavoritesQueryOptions } from "@/features/favorites/hooks"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/bin")({
  component: BinPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getBinQueryOptions())
  }
})

function BinPage() {
  const queryOptions = useMemo(() => getFavoritesQueryOptions(), [])
  return <MainImageView queryOptions={queryOptions} />
}

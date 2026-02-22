import { MainImageView } from "@/components/view"
import { getBinQueryOptions } from "@/features/bin/hooks"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/bin")({
  component: BinPage,
  loader: ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(getBinQueryOptions())
  }
})

function BinPage() {
  const queryOptions = useMemo(() => getBinQueryOptions(), [])
  return <MainImageView queryOptions={queryOptions} />
}

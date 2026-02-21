import { MainImageView } from "@/components/view"
import { getTagQueryOptions } from "@/features/tags/hooks/get-tag-query-options"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/tags/$tagid")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureInfiniteQueryData(
      getTagQueryOptions(Number.parseInt(params.tagid))
    )
  }
})

function RouteComponent() {
  const { tagid } = useParams({ from: "/tags/$tagid" })
  const queryOptions = useMemo(() => getTagQueryOptions(Number(tagid)), [tagid])
  return <MainImageView queryOptions={queryOptions} />
}

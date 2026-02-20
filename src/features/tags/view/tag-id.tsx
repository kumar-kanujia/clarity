import { ImageGrid } from "@/components/layout/image-grid"
import { useTagQueryOptions } from "../hooks/use-tag-query-options"
import { useParams } from "@tanstack/react-router"

export const TagIdView = () => {
  const { tagid } = useParams({ from: "/tags/$tagid" })
  const { queryOption } = useTagQueryOptions(Number(tagid))
  return <ImageGrid queryOptions={queryOption} />
}

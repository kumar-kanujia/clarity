import { ImageGrid } from "@/components/layout/image-grid"
import { useBinQueryOptions } from "../hooks"

export const BinView = () => {
  const { queryOption } = useBinQueryOptions()
  return <ImageGrid queryOptions={queryOption} inBinView />
}

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"
import { useToggleFavorite } from "../../hooks"

export const FavoriteButton = ({
  isFavorite,
  className,
  imageId
}: {
  isFavorite: boolean
  className?: string
  imageId: number
}) => {
  const { mutate, data } = useToggleFavorite()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    mutate({ imageId })
  }

  const state = data ?? isFavorite

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      className={cn(
        "rounded-2xl bg-zinc-900/20 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100",
        state &&
          "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white opacity-100",
        className
      )}
      onClick={handleClick}
    >
      <Heart className={cn("size-4.5", state && "fill-current")} />
    </Button>
  )
}

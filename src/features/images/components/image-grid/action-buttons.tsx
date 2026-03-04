import { cn } from "@/lib/utils"
import { Heart, Loader2, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useToggleFavorite, useUndoMoveToTrash } from "@/features/images/hooks"

const baseClassName = cn(
  "rounded-xl border border-primary-foreground/10 bg-background/20 backdrop-blur-xl",
  "opacity-0 group-hover:opacity-100",
  "transition-all duration-200 ease-out",
  "hover:bg-white hover:text-zinc-950 hover:border-transparent hover:shadow-md",
  "active:scale-90"
)

export const UndoTrashButton = ({ imageId }: { imageId: number }) => {
  const { mutate, isPending } = useUndoMoveToTrash()

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      disabled={isPending}
      className={baseClassName}
      onClick={(e) => {
        e.stopPropagation()
        mutate({ imageIds: [imageId] })
      }}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Undo2 className="size-3.5" />
      )}
    </Button>
  )
}

export const FavoriteButton = ({
  imageId,
  isFavorite,
  className
}: {
  imageId: number
  isFavorite: boolean
  className?: string
}) => {
  const { mutate, data } = useToggleFavorite()
  const favorited = data ?? isFavorite

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      className={cn(
        baseClassName,
        favorited && [
          "border-red-400/60 opacity-100",
          "bg-red-500 text-white hover:border-red-500/60 hover:bg-red-600 hover:text-white",
          "shadow-md shadow-red-500/30"
        ],
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        mutate({ imageId })
      }}
    >
      <Heart
        className={cn(
          "size-3.5 transition-transform duration-150",
          favorited ? "scale-110 fill-current" : "scale-100"
        )}
      />
    </Button>
  )
}

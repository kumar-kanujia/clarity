import { cn } from "@/lib/utils"
import { Heart, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useToggleFavorite, useUndoMoveToTrash } from "@/features/images/hooks"

const baseClassName =
  "bg-background/20 border-primary-foreground/10 rounded-2xl border opacity-0 backdrop-blur-xl transition-all duration-300 ease-in-out group-hover:opacity-100 hover:bg-white hover:text-zinc-950"

export const UndoTrashButton = ({ imageId }: { imageId: number }) => {
  const { mutate, isPending } = useUndoMoveToTrash()

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      className={baseClassName}
      onClick={(e) => {
        e.stopPropagation()
        mutate({ imageIds: [imageId] })
      }}
      disabled={isPending}
    >
      <Undo2 className="size-4.5" />
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
        baseClassName,
        state &&
          "border-red-500 bg-red-500 text-white opacity-100 hover:bg-red-600 hover:text-white",
        className
      )}
      onClick={handleClick}
    >
      <Heart className={cn("size-4.5", state && "fill-current")} />
    </Button>
  )
}

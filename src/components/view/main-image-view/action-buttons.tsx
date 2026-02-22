import { Undo2, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useUndoMoveToBin } from "@/features/bin/hooks"
import { useToggleFavorite } from "@/features/favorites/hooks"

const baseClass =
  "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300 cursor-pointer"

export const UndoBinButton = ({ id }: { id: number }) => {
  const { mutate, isPending } = useUndoMoveToBin(id)

  return (
    <Button
      size="icon"
      variant="secondary"
      className={baseClass}
      onClick={(e) => {
        e.stopPropagation()
        mutate()
      }}
      disabled={isPending}
    >
      <Undo2 className="size-4.5" />
    </Button>
  )
}

export const FavoriteButton = ({
  id,
  favorite
}: {
  id: number
  favorite: boolean
}) => {
  const { data, isPending, mutate } = useToggleFavorite(id)

  // Use the mutation result if it exists (even if it's false!),
  // otherwise fallback to the initial prop from the parent.
  const isFavorited = data ?? favorite

  return (
    <Button
      size="icon"
      variant="secondary"
      className={cn(
        baseClass,
        isFavorited &&
          "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white"
      )}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation()
        mutate()
      }}
    >
      <Heart className={cn("w-4.5 h-4.5", isFavorited && "fill-current")} />
    </Button>
  )
}

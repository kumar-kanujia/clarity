import { useEffect, useState } from "react"
import { Trash, Undo2 } from "lucide-react"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useMoveToBin, useUndoMoveToBin } from "@/features/bin/hooks"
import { useToggleFavorite } from "@/features/favorites/hooks"

export const BinButton = ({ id }: { id: number }) => {
  const { mutate, isPending } = useMoveToBin(id)

  const handleMoveToBin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    mutate()
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      className={
        "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300"
      }
      onClick={handleMoveToBin}
      disabled={isPending}
    >
      <Trash className="w-4.5 h-4.5" />
    </Button>
  )
}

export const UndoBinButton = ({ id }: { id: number }) => {
  const { mutate, isPending } = useUndoMoveToBin(id)

  const handleUndoMoveToBin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    mutate()
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      className={
        "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300"
      }
      onClick={handleUndoMoveToBin}
      disabled={isPending}
    >
      <Undo2 className="w-4.5 h-4.5" />
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
  const [isFavorite, setIsFavorite] = useState(favorite)

  const { data, isPending, isSuccess, mutate, isError } = useToggleFavorite(id)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite((prev) => !prev)
    mutate()
  }

  useEffect(() => {
    if (isError) setIsFavorite((prev) => !prev)

    if (isSuccess) setIsFavorite(data!)
  }, [isError, isSuccess])

  return (
    <Button
      size="icon"
      variant="secondary"
      className={cn(
        "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300 cursor-pointer",
        isFavorite &&
          "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white"
      )}
      disabled={isPending}
      onClick={handleToggleFavorite}
    >
      <Heart className={cn("w-4.5 h-4.5", isFavorite && "fill-current")} />
    </Button>
  )
}

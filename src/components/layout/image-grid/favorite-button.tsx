import { Heart } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { useToggleFavorite } from "@/features/favorites/hooks"

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
        "h-9 w-9 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 hover:bg-white hover:text-zinc-950 transition-all duration-300",
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

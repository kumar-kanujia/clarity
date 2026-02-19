import { Button } from "@/components/ui/button"
import { useMoveToBin } from "@/features/bin/hooks"
import { cn } from "@/lib/utils"
import { Trash } from "lucide-react"

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
      <Trash className={cn("w-4.5 h-4.5")} />
    </Button>
  )
}

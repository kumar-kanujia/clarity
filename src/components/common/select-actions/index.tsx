import { Button } from "@/components/ui/button"
import { BinButton } from "@/features/bin/components"
import {
  useMoveMultipleToBin,
  useUndoMultipleMoveToBin
} from "@/features/bin/hooks"
import { useSelectStore } from "@/store"
import { useLocation } from "@tanstack/react-router"
import { LucideTrash2, Undo2Icon } from "lucide-react"
import { useEffect } from "react"

export const SelectAction = () => {
  const { pathname } = useLocation()

  const { imageIds, reset } = useSelectStore()

  const { mutate, isSuccess, isPending } = useMoveMultipleToBin()
  const { mutate: undoMutate, isSuccess: undoIsSuccess } =
    useUndoMultipleMoveToBin()

  useEffect(() => {
    if (isSuccess || undoIsSuccess) {
      reset()
    }
  }, [isSuccess, undoIsSuccess])

  return (
    <div className="flex items-center justify-between me-4">
      {pathname !== "/bin" && imageIds.size > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:text-red-400"
          onClick={() => {
            mutate(Array.from(imageIds))
          }}
          disabled={isPending}
        >
          <LucideTrash2 />
        </Button>
      )}
      {pathname === "/bin" && imageIds.size > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            undoMutate(Array.from(imageIds))
          }}
        >
          <Undo2Icon />
        </Button>
      )}
      <BinButton />
    </div>
  )
}

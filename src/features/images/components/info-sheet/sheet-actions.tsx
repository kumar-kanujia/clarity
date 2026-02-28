import { Button } from "@/components/ui/button"
import { Trash, Undo } from "lucide-react"
import { useMoveToTrash, useUndoMoveToTrash } from "../../hooks"
import { useLocation } from "@tanstack/react-router"

export const SheetActions = ({
  imageId,
  close
}: {
  imageId: number
  close: () => void
}) => {
  const { pathname } = useLocation()

  const { mutate: moveToTrash, isPending: isPendingMove } = useMoveToTrash()

  const { mutate: undoMoveToTrash, isPending: isPendingUndo } =
    useUndoMoveToTrash()

  return (
    <div className="space-y-4 w-full flex items-center justify-center ">
      {pathname === "/trash" && (
        <Button
          variant={"outline"}
          onClick={() =>
            undoMoveToTrash({ imageId }, { onSuccess: () => close() })
          }
          disabled={isPendingUndo}
        >
          <Undo />
          <span>Restore</span>
        </Button>
      )}
      {pathname !== "/trash" && (
        <Button
          variant={"destructive"}
          onClick={() => moveToTrash({ imageId }, { onSuccess: () => close() })}
          disabled={isPendingMove}
        >
          <Trash />
          <span>Move to trash</span>
        </Button>
      )}
    </div>
  )
}

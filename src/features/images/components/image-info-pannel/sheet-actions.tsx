import { Button } from "@/components/ui/button"
import { Trash, Undo } from "lucide-react"
import { useMoveToTrash, useUndoMoveToTrash } from "../../hooks"

interface SheetActionsProps {
  imageId: number
  close: () => void
  isTrashRoue?: boolean
}

export const SheetActions = ({
  imageId,
  isTrashRoue,
  close
}: SheetActionsProps) => {
  const { mutate: moveToTrash, isPending: isPendingMove } = useMoveToTrash()

  const { mutate: undoMoveToTrash, isPending: isPendingUndo } =
    useUndoMoveToTrash()

  return (
    <div className="flex w-full items-center justify-center space-y-4">
      {isTrashRoue ? (
        <Button
          variant={"outline"}
          onClick={() =>
            undoMoveToTrash(
              { imageIds: [imageId] },
              { onSuccess: () => close() }
            )
          }
          disabled={isPendingUndo}
        >
          <Undo />
          <span>Restore</span>
        </Button>
      ) : (
        <Button
          variant={"destructive"}
          onClick={() =>
            moveToTrash({ imageIds: [imageId] }, { onSuccess: () => close() })
          }
          disabled={isPendingMove}
        >
          <Trash />
          <span>Move to trash</span>
        </Button>
      )}
    </div>
  )
}

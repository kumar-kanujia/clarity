import { Button } from "@/components/ui/button"
import { Loader2, Undo } from "lucide-react"
import { useUndoMoveToTrash } from "../../hooks"
import { actionBtn } from "."

export const RestoreImages = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const { mutate, isPending } = useUndoMoveToTrash()
  if (imageIds.length === 0) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      className={actionBtn}
      onClick={() => mutate({ imageIds }, { onSuccess })}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Undo className="size-3.5" />
      )}
      Restore
    </Button>
  )
}

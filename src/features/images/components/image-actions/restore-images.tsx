import { Button } from "@/components/ui/button"
import { Undo } from "lucide-react"
import { useUndoMoveToTrash } from "../../hooks"

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
      variant={"ghost"}
      disabled={isPending}
      onClick={() => mutate({ imageIds }, { onSuccess })}
    >
      <Undo /> Restore
    </Button>
  )
}

import { Button } from "@/components/ui/button"
import { Loader2, Trash } from "lucide-react"
import { useMoveToTrash } from "../../hooks"
import { destructiveBtn } from "."

export const MoveToTrash = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const { mutate, isPending } = useMoveToTrash()
  if (imageIds.length === 0) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      className={destructiveBtn}
      onClick={() => mutate({ imageIds }, { onSuccess })}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash className="size-3.5" />
      )}
      Move to trash
    </Button>
  )
}

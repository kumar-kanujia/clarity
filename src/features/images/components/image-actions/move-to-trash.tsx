import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { useMoveToTrash } from "../../hooks"

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
      variant={"ghost"}
      className="hover:text-red-600 flex"
      disabled={isPending}
      onClick={() => mutate({ imageIds }, { onSuccess })}
    >
      <Trash /> Move to trash
    </Button>
  )
}

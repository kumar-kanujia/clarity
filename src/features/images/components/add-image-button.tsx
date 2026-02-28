import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { ComponentProps } from "react"

export const AddImageButton = ({ ...props }: ComponentProps<typeof Button>) => {
  return (
    <Button variant="ghost" size="icon-sm" {...props}>
      <Plus className="size-5" />
    </Button>
  )
}

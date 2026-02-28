import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, TagIcon, Trash2, TrashIcon, Undo2 } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import type { TagItem } from "@/tauri"
import { Card, CardContent } from "@/components/ui/card"
import { useRestoreTag, useSoftDeleteTag } from "../hooks/use-tag"
import { useDeleteTagStore, useEditTagStore } from "../store/tag-store"

export const TagCard = ({
  tag,
  isInactive
}: {
  tag: TagItem
  isInactive?: boolean
}) => {
  const { navigate } = useRouter()

  const { openDeleteDialog } = useDeleteTagStore()
  const { openEditDialog } = useEditTagStore()

  const { mutate: softDelete, isPending: softDeletePending } =
    useSoftDeleteTag()

  const { mutate: restore, isPending: restorePending } = useRestoreTag()

  return (
    <Card
      key={tag.id}
      className="group relative overflow-hidden border bg-background hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-xl"
      onClick={() => {
        if (isInactive) return
        navigate({ to: "/tags/$tagid", params: { tagid: tag.id.toString() } })
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${tag.tagColor}15` }}
            >
              <TagIcon className="w-5 h-5" style={{ color: tag.tagColor }} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base tracking-tight">
                {tag.tagName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={"outline"}
                  className="text-[10px] font-mono h-5 px-1.5 rounded-md bg-muted/50 border-none"
                >
                  {tag.imageCount} items
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center  gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isInactive ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (restorePending) return
                    restore(tag.id)
                  }}
                >
                  <Undo2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(tag)
                  }}
                >
                  <TrashIcon />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditDialog(tag)
                  }}
                >
                  <Edit2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (softDeletePending) return
                    softDelete(tag.id)
                  }}
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

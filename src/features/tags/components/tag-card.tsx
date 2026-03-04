import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, TagIcon, Trash2, TrashIcon, Undo2 } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import type { TagItem } from "@/tauri"
import { Card, CardContent } from "@/components/ui/card"
import { useMarkTagActive, useMarkTagInactive } from "../hooks"
import { useDeleteTagStore, useEditTagStore } from "../store/tag-store"
import { cn } from "@/lib/utils"

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

  const { mutate: markInactive, isPending: markInactivePending } =
    useMarkTagInactive()

  const { mutate: markActive, isPending: markActivePending } =
    useMarkTagActive()

  return (
    <Card
      key={tag.id}
      className={cn(
        "group bg-background hover:border-primary/50 relative cursor-pointer overflow-hidden border shadow-sm transition-all duration-500 hover:shadow-xl",
        isInactive && "cursor-default opacity-75 hover:border"
      )}
      onClick={() => {
        if (isInactive) return
        navigate({ to: "/tags/$tagid", params: { tagid: tag.id.toString() } })
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${tag.tagColor}15` }}
            >
              <TagIcon className="h-5 w-5" style={{ color: tag.tagColor }} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold tracking-tight">
                {tag.tagName}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge
                  variant={"outline"}
                  className="bg-muted/50 h-5 rounded-md border-none px-1.5 font-mono text-[10px]"
                >
                  {tag.imageCount} items
                </Badge>
              </div>
            </div>
          </div>
          <TagCardActions
            isInactive={Boolean(isInactive)}
            isMarkActivePending={markActivePending}
            isMarkInactivePending={markInactivePending}
            onMarkActive={() => markActive(tag.id)}
            onMarkInactive={() => markInactive(tag.id)}
            onEdit={() => openEditDialog(tag)}
            onDelete={() => openDeleteDialog(tag)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface TagCardActionsProps {
  isInactive: boolean
  isMarkActivePending: boolean
  isMarkInactivePending: boolean
  onMarkActive: () => void
  onMarkInactive: () => void
  onEdit: () => void
  onDelete: () => void
}

const TagCardActions = ({
  isInactive,
  isMarkActivePending,
  isMarkInactivePending,
  onMarkActive,
  onMarkInactive,
  onEdit,
  onDelete
}: TagCardActionsProps) => {
  const baseButtonClass =
    "rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"

  if (isInactive) {
    return (
      <div className="flex flex-col justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className={baseButtonClass}
          onClick={(e) => {
            e.stopPropagation()
            if (isMarkActivePending) return
            onMarkActive()
          }}
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`${baseButtonClass} hover:text-destructive`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <TrashIcon />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        className={baseButtonClass}
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
      >
        <Edit2 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${baseButtonClass} hover:text-destructive`}
        onClick={(e) => {
          e.stopPropagation()
          if (isMarkInactivePending) return
          onMarkInactive()
        }}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

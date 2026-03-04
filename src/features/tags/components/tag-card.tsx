import { Button } from "@/components/ui/button"
import { Loader2, Pencil, TagIcon, Trash, Trash2, Undo2 } from "lucide-react"
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
      className={cn(
        "group relative cursor-pointer overflow-hidden border shadow-sm",
        "bg-background hover:border-primary/30 hover:shadow-lg",
        "transition-all duration-200",
        isInactive && "hover:border-border cursor-default opacity-60"
      )}
      onClick={() => {
        if (isInactive) return
        navigate({ to: "/tags/$tagid", params: { tagid: tag.id.toString() } })
      }}
    >
      <CardContent className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Icon + name */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${tag.tagColor}18` }}
            >
              <TagIcon className="size-4" style={{ color: tag.tagColor }} />
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight">
                {tag.tagName}
              </span>
              <span className="text-muted-foreground/70 mt-0.5 text-[11px] tabular-nums">
                {tag.imageCount} {tag.imageCount === 1 ? "image" : "images"}
              </span>
            </div>
          </div>

          {/* Actions */}
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

const actionBtn = cn(
  "size-7 rounded-lg",
  "opacity-0 group-hover:opacity-100",
  "transition-opacity duration-150",
  "cursor-pointer"
)

const TagCardActions = ({
  isInactive,
  isMarkActivePending,
  isMarkInactivePending,
  onMarkActive,
  onMarkInactive,
  onEdit,
  onDelete
}: TagCardActionsProps) => {
  if (isInactive) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={isMarkActivePending}
          className={actionBtn}
          onClick={(e) => {
            e.stopPropagation()
            onMarkActive()
          }}
        >
          {isMarkActivePending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Undo2 className="size-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(actionBtn, "hover:bg-red-500/10 hover:text-red-500")}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={actionBtn}
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
      >
        <Pencil className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isMarkInactivePending}
        className={cn(actionBtn, "hover:bg-red-500/10 hover:text-red-500")}
        onClick={(e) => {
          e.stopPropagation()
          onMarkInactive()
        }}
      >
        {isMarkInactivePending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </Button>
    </div>
  )
}

import { useQuery } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { Loader2, Trash2 } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"

import {
  getAttachedTagsQueryOptions,
  getAvailableTagsQueryOptions
} from "@/features/images/queries"
import { useMoveToTrash, useToggleTag } from "@/features/images/hooks"
import { cn } from "@/lib/utils"

interface TagMenuSectionProps {
  label: string
  tags: { id: number; tagName: string; tagColor: string }[]
  imageId: number
  onToggleTag: (args: { imageId: number; tagId: number }) => void
  disabled: boolean
}

const TagMenuSection = ({
  label,
  tags,
  imageId,
  onToggleTag,
  disabled
}: TagMenuSectionProps) => (
  <ContextMenuGroup>
    <ContextMenuLabel className="text-muted-foreground/70 px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
      {label}
    </ContextMenuLabel>
    {tags.map((tag) => (
      <ContextMenuItem
        key={tag.id}
        disabled={disabled}
        onClick={() => onToggleTag({ imageId, tagId: tag.id })}
        className="cursor-pointer gap-2.5 px-2 py-1.5"
      >
        <span
          className="size-3 shrink-0 rounded-full shadow-sm ring-1 ring-black/10"
          style={{ backgroundColor: tag.tagColor }}
        />
        <span className="truncate">{tag.tagName}</span>
      </ContextMenuItem>
    ))}
  </ContextMenuGroup>
)

interface ImageOptionsProps {
  children: ReactNode
  imageId: number
  hidden?: boolean
}

export const ImageOptions = ({
  children,
  imageId,
  hidden
}: ImageOptionsProps) => {
  if (hidden) return <>{children}</>
  return <ActiveContextMenu imageId={imageId}>{children}</ActiveContextMenu>
}

const ActiveContextMenu = ({
  children,
  imageId
}: {
  children: ReactNode
  imageId: number
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { data: attachedTags, isSuccess: hasAttachedSuccess } = useQuery({
    ...getAttachedTagsQueryOptions(imageId, 5),
    enabled: isOpen
  })

  const { data: availableTags, isSuccess: hasAvailableSuccess } = useQuery({
    ...getAvailableTagsQueryOptions(imageId, 5),
    enabled: isOpen
  })

  const { mutate: toggleTag, isPending: isTagPending } = useToggleTag()
  const { mutate: moveToTrash, isPending: isTrashPending } = useMoveToTrash()

  const hasAttachedTags = hasAttachedSuccess && attachedTags.length > 0
  const hasAvailableTags = hasAvailableSuccess && availableTags.length > 0
  const hasTags = hasAttachedTags || hasAvailableTags

  const tagSectionProps = {
    imageId,
    onToggleTag: toggleTag,
    disabled: isTagPending
  }

  return (
    <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className={cn(
          "w-40 rounded-xl p-1",
          "bg-background/50 backdrop-blur-xl",
          "border border-white/10 shadow-xl shadow-black/20"
        )}
      >
        {/* Loading skeleton while fetching */}
        {isOpen && !hasAttachedSuccess && !hasAvailableSuccess && (
          <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-xs">
            <Loader2 className="size-3 animate-spin" />
            Loading tags…
          </div>
        )}

        {hasAttachedTags && (
          <TagMenuSection
            label="Attached"
            tags={attachedTags}
            {...tagSectionProps}
          />
        )}

        {hasAttachedTags && hasAvailableTags && (
          <ContextMenuSeparator className="mx-1 bg-white/10" />
        )}

        {hasAvailableTags && (
          <TagMenuSection
            label="Add tag"
            tags={availableTags}
            {...tagSectionProps}
          />
        )}

        {hasTags && <ContextMenuSeparator className="mx-1 bg-white/10" />}

        <ContextMenuGroup>
          <ContextMenuItem
            variant="destructive"
            disabled={isTrashPending}
            onClick={(e) => {
              e.stopPropagation()
              moveToTrash({ imageIds: [imageId] })
            }}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5 rounded-lg px-2 py-1.5"
          >
            {isTrashPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Move to Trash
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

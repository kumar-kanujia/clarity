import { useQuery } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { TagIcon, Trash2 } from "lucide-react"

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
    <ContextMenuLabel>{label}</ContextMenuLabel>
    {tags.map((tag) => (
      <ContextMenuItem
        key={tag.id}
        onClick={() => onToggleTag({ imageId, tagId: tag.id })}
        disabled={disabled}
      >
        <TagIcon
          style={{ backgroundColor: tag.tagColor }}
          className="mr-2 rounded-3xl p-2"
        />
        {tag.tagName}
      </ContextMenuItem>
    ))}
  </ContextMenuGroup>
)

interface ImageOptionsProps {
  children: ReactNode
  imageId: number
  hideOptions?: boolean
}

export const ImageOptions = ({
  children,
  imageId,
  hideOptions
}: ImageOptionsProps) => {
  if (hideOptions) return <>{children}</>

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

  const { data: attachedTagData, isSuccess: attachedTagFetchSuccess } =
    useQuery({
      ...getAttachedTagsQueryOptions(imageId, 5),
      enabled: isOpen
    })

  const { data: availableTagData, isSuccess: availableTagFetchSuccess } =
    useQuery({
      ...getAvailableTagsQueryOptions(imageId, 5),
      enabled: isOpen
    })

  const { mutate: toggleTag, isPending: isTagPending } = useToggleTag()

  const { mutate: moveToTrash, isPending: isTrashPending } = useMoveToTrash()

  const hasAttachedTags = attachedTagFetchSuccess && attachedTagData.length > 0

  const hasAvailableTags =
    availableTagFetchSuccess && availableTagData.length > 0

  return (
    <ContextMenu onOpenChange={setIsOpen} open={isOpen}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent className="bg-background/80 w-48">
        {hasAttachedTags && (
          <TagMenuSection
            label="Attached Tags"
            tags={attachedTagData}
            imageId={imageId}
            onToggleTag={toggleTag}
            disabled={isTagPending}
          />
        )}

        {hasAttachedTags && hasAvailableTags && <ContextMenuSeparator />}

        {hasAvailableTags && (
          <TagMenuSection
            label="Attach a new tag"
            tags={availableTagData}
            imageId={imageId}
            onToggleTag={toggleTag}
            disabled={isTagPending}
          />
        )}

        {(hasAttachedTags || hasAvailableTags) && <ContextMenuSeparator />}

        <ContextMenuGroup>
          <ContextMenuItem
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              moveToTrash({ imageIds: [imageId] })
            }}
            disabled={isTrashPending}
          >
            <Trash2 className="mr-2 size-4" /> Move to Trash
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

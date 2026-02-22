import { useState, type ReactNode } from "react"
import { TagIcon, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

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
  getAvailableTagsQueryOptions,
  useToggleTag
} from "@/features/tags/hooks"

import { useMoveToBin } from "@/features/bin/hooks"

interface ImageOptionsProps {
  children: ReactNode
  imageId: number
  isBinView?: boolean
}

// 1. The Gateway Component
export const ImageOptions = ({
  children,
  imageId,
  isBinView
}: ImageOptionsProps) => {
  if (isBinView) return <>{children}</>

  return <ActiveContextMenu imageId={imageId}>{children}</ActiveContextMenu>
}

// 2. The Active Component
const ActiveContextMenu = ({
  children,
  imageId
}: {
  children: ReactNode
  imageId: number
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Lazy fetching: only loads when context menu opens
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

  const { mutate: moveToBin, isPending: isMoveToBinPending } =
    useMoveToBin(imageId)
  const { mutate: toggleTag, isPending: isTagPending } = useToggleTag(imageId)

  return (
    <ContextMenu onOpenChange={setIsOpen}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      {/* Restored original styling */}
      <ContextMenuContent className="bg-zinc-900/80 w-48">
        {attachedTagFetchSuccess && attachedTagData.length > 0 && (
          <>
            <ContextMenuGroup>
              <ContextMenuLabel>Attached Tags</ContextMenuLabel>
              {attachedTagData.map((tag) => (
                <ContextMenuItem
                  key={tag.id}
                  onClick={() => toggleTag({ imageId, tagId: tag.id })}
                  disabled={isTagPending}
                >
                  {/* Restored original TagIcon styling */}
                  <TagIcon
                    style={{ backgroundColor: tag.tagColor }}
                    className="p-2 rounded-3xl mr-2"
                  />
                  {tag.tagName}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
            <ContextMenuSeparator />
          </>
        )}

        {availableTagFetchSuccess && availableTagData.length > 0 && (
          <>
            <ContextMenuGroup>
              <ContextMenuLabel>Attach a new tag</ContextMenuLabel>
              {availableTagData.map((tag) => (
                <ContextMenuItem
                  key={tag.id}
                  onClick={() => toggleTag({ imageId, tagId: tag.id })}
                  disabled={isTagPending}
                >
                  {/* Restored original TagIcon styling */}
                  <TagIcon
                    style={{ backgroundColor: tag.tagColor }}
                    className="p-2 rounded-3xl mr-2"
                  />
                  {tag.tagName}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuGroup>
          <ContextMenuItem
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              moveToBin()
            }}
            disabled={isMoveToBinPending}
          >
            {/* Restored original Trash styling */}
            <Trash2 className="mr-2 size-4" /> Move to Bin
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

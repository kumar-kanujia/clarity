import { type ReactNode } from "react"
import { TagIcon, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"

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
  useGetAttachedTags,
  useGetAvilableTags,
  useToggleTag
} from "@/features/tags/hooks"

import { useMoveToBin } from "@/features/bin/hooks"

interface ImageOptionsProps {
  children: ReactNode
  id: number
}

export const ImageOptions = ({ children, id }: ImageOptionsProps) => {
  const { pathname } = useLocation()

  const { queryOption: attachedQueryOption } = useGetAttachedTags(id, 5)
  const { queryOption: availableQueryOption } = useGetAvilableTags(id, 5)

  const { mutate, isPending } = useMoveToBin(id)

  const { mutate: toggleTag, isPending: isTagPending } = useToggleTag()

  const handleMoveToBin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    mutate()
  }

  const { data: attachedTagData, isSuccess: attachedTagFetchSuccess } =
    useQuery(attachedQueryOption)

  const { data: availableTagData, isSuccess: availableTagFetchSuccess } =
    useQuery(availableQueryOption)

  if (pathname === "/bin") {
    return <>{children}</>
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="bg-zinc-900/80 w-48">
        {attachedTagFetchSuccess && attachedTagData.length > 0 && (
          <>
            <ContextMenuGroup>
              <ContextMenuLabel>Attached Tags</ContextMenuLabel>
              {attachedTagData.map((tag) => (
                <ContextMenuItem
                  key={tag.id}
                  onClick={() => toggleTag({ imageId: id, tagId: tag.id })}
                  disabled={isTagPending}
                >
                  <TagIcon
                    style={{ backgroundColor: tag.tagColor }}
                    className="p-2 rounded-3xl"
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
                  onClick={() => toggleTag({ imageId: id, tagId: tag.id })}
                  disabled={isTagPending}
                >
                  <TagIcon
                    style={{ backgroundColor: tag.tagColor }}
                    className="p-2 rounded-3xl"
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
            onClick={handleMoveToBin}
            disabled={isPending}
          >
            <Trash2 /> Move to Bin
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

import { useQuery } from "@tanstack/react-query"
import { Loader2, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  getAttachedTagsQueryOptionsMultiple,
  getAvailableTagsQueryOptionsMultiple
} from "../../queries"

import { useAttachTag, useRemoveTag } from "../../hooks"
import { actionBtn } from "."

const TagDot = ({ color }: { color: string }) => (
  <span
    className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
    style={{ backgroundColor: color }}
  />
)

export const TagAction = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const enabled = imageIds.length > 0

  const { data: attachedTags, isSuccess: isAttachedSuccess } = useQuery({
    ...getAttachedTagsQueryOptionsMultiple(imageIds, 20),
    enabled
  })
  const { data: availableTags, isSuccess: isAvailableSuccess } = useQuery({
    ...getAvailableTagsQueryOptionsMultiple(imageIds, 20),
    enabled
  })

  const { mutate: attachTag, isPending: isPendingAttach } = useAttachTag()
  const { mutate: removeTag, isPending: isPendingRemove } = useRemoveTag()

  if (!enabled) return null

  const hasAttached = isAttachedSuccess && attachedTags.length > 0
  const hasAvailable = isAvailableSuccess && availableTags.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className={actionBtn} />}
      >
        <Tag className="size-3.5" />
        Tags
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-background/85 w-48 rounded-xl border-white/10 p-1 shadow-xl shadow-black/20 backdrop-blur-xl">
        {hasAttached && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-muted-foreground/70 px-2 py-1.5 text-xs tracking-wider uppercase">
              Attached
            </DropdownMenuLabel>
            {attachedTags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                disabled={isPendingRemove}
                className="cursor-pointer gap-2.5 px-2"
                onClick={() =>
                  removeTag({ imageIds, tagId: tag.id }, { onSuccess })
                }
              >
                <TagDot color={tag.tagColor} />
                <span className="truncate">{tag.tagName}</span>
                <X className="text-muted-foreground/50 ml-auto size-3" />
              </DropdownMenuItem>
            ))}
            {hasAvailable && (
              <DropdownMenuSeparator className="mx-1 bg-white/10" />
            )}
          </DropdownMenuGroup>
        )}

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground/70 px-2 py-1.5 text-xs tracking-wider uppercase">
            Add tag
          </DropdownMenuLabel>
          {!isAvailableSuccess && (
            <DropdownMenuItem disabled className="text-muted-foreground gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </DropdownMenuItem>
          )}
          {isAvailableSuccess && !hasAvailable && (
            <DropdownMenuItem
              disabled
              className="text-muted-foreground/60 text-xs"
            >
              No tags available
            </DropdownMenuItem>
          )}
          {hasAvailable &&
            availableTags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                disabled={isPendingAttach}
                className="cursor-pointer gap-2.5 px-2"
                onClick={() =>
                  attachTag({ imageIds, tagId: tag.id }, { onSuccess })
                }
              >
                <TagDot color={tag.tagColor} />
                <span className="truncate">{tag.tagName}</span>
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

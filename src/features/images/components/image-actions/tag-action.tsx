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
import { useQuery } from "@tanstack/react-query"
import {
  getAttachedTagsQueryOptionsMultiple,
  getAvailableTagsQueryOptionsMultiple
} from "../../queries"
import { Tag } from "lucide-react"
import { useAttachTag, useRemoveTag } from "../../hooks"

export const TagAction = ({
  imageIds,
  onSuccess
}: {
  imageIds: number[]
  onSuccess?: () => void
}) => {
  const { data: attachedTags, isSuccess: isAttachedSuccess } = useQuery({
    ...getAttachedTagsQueryOptionsMultiple(imageIds, 20),
    enabled: imageIds.length > 0
  })

  const { data: availableTags, isSuccess: isAvailableSuccess } = useQuery({
    ...getAvailableTagsQueryOptionsMultiple(imageIds, 20),
    enabled: imageIds.length > 0
  })

  const { mutate: attachTag, isPending: isPendingAttach } = useAttachTag()
  const { mutate: removeTag, isPending: isPendingRemove } = useRemoveTag()

  if (imageIds.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        Tags
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isAttachedSuccess && attachedTags.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Attached</DropdownMenuLabel>
            {attachedTags?.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                style={{ color: tag.tagColor }}
                onClick={() => {
                  removeTag({ imageIds, tagId: tag.id }, { onSuccess })
                }}
                disabled={isPendingRemove}
              >
                <Tag />
                {tag.tagName}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        {isAvailableSuccess && availableTags.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Available</DropdownMenuLabel>
            {availableTags?.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                style={{ color: tag.tagColor }}
                onClick={() => {
                  attachTag({ imageIds, tagId: tag.id }, { onSuccess })
                }}
                disabled={isPendingAttach}
              >
                <Tag />
                {tag.tagName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

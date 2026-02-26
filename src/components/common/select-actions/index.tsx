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

import { BinButton, BinButton2 } from "@/features/bin/components"
import {
  useMoveMultipleToBin,
  useUndoMultipleMoveToBin
} from "@/features/bin/hooks"
import {
  getSelectAttachedTagsQueryOptions,
  getSelectAvilableTagsQueryOptions,
  useAttachTag,
  useRemoveTag
} from "@/features/tags/hooks"
import { useSelectStore } from "@/store"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"
import { LucideTrash2, Tag, TagIcon, Undo2Icon } from "lucide-react"
import { useEffect } from "react"

export const SelectAction = () => {
  const { pathname } = useLocation()

  const { imageIds, reset } = useSelectStore()

  const { mutate, isSuccess, isPending } = useMoveMultipleToBin()
  const { mutate: undoMutate, isSuccess: undoIsSuccess } =
    useUndoMultipleMoveToBin()

  useEffect(() => {
    if (isSuccess || undoIsSuccess) {
      reset()
    }
  }, [isSuccess, undoIsSuccess])

  return (
    <div className="flex items-center justify-between me-4">
      {pathname !== "/bin" && imageIds.size > 0 && (
        <>
          <TagMenu />
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:text-red-400"
            onClick={() => {
              mutate(Array.from(imageIds))
            }}
            disabled={isPending}
          >
            <LucideTrash2 />
          </Button>
        </>
      )}
      {pathname === "/bin" && imageIds.size > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            undoMutate(Array.from(imageIds))
          }}
        >
          <Undo2Icon />
        </Button>
      )}
      <BinButton />
      <BinButton2 />
    </div>
  )
}

const TagMenu = () => {
  const { imageIds, reset } = useSelectStore()

  const { data, isSuccess } = useQuery(
    getSelectAttachedTagsQueryOptions(Array.from(imageIds))
  )

  const { data: availableTags, isSuccess: availableTagsIsSuccess } = useQuery(
    getSelectAvilableTagsQueryOptions(Array.from(imageIds))
  )

  const { mutate: attachTag } = useAttachTag()

  const { mutate: removeTag } = useRemoveTag()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={"ghost"} size={"icon-sm"} />}
      >
        <Tag />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isSuccess && data.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Attached Tag</DropdownMenuLabel>
            {data.map((tag) => {
              return (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => {
                    removeTag(
                      { imageIds: Array.from(imageIds), tagId: tag.id },
                      {
                        onSuccess: () => {
                          reset()
                        }
                      }
                    )
                  }}
                >
                  <TagIcon style={{ color: tag.tagColor }} /> {tag.tagName}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        {availableTagsIsSuccess && availableTags.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Attach a new Tag</DropdownMenuLabel>
            {availableTags.map((tag) => {
              return (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => {
                    attachTag(
                      { imageIds: Array.from(imageIds), tagId: tag.id },
                      {
                        onSuccess: () => {
                          reset()
                        }
                      }
                    )
                  }}
                >
                  <TagIcon style={{ color: tag.tagColor }} /> {tag.tagName}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

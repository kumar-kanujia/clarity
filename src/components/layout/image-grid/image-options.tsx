import { type ReactNode } from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { TagIcon, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useGetTopTags } from "@/features/tag/hooks"
import { useMoveToBin } from "@/features/bin/hooks"
import { useLocation } from "@tanstack/react-router"

interface ImageOptionsProps {
  children: ReactNode
  id: number
}

export const ImageOptions = ({ children, id }: ImageOptionsProps) => {
  const { pathname } = useLocation()
  const { queryOption } = useGetTopTags()
  const { mutate, isPending } = useMoveToBin(id)

  const handleMoveToBin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    mutate()
  }

  const { data, isSuccess } = useQuery(queryOption)

  if (pathname === "/bin") {
    return <>{children}</>
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="bg-zinc-900/80 w-48">
        {isSuccess && data.length > 0 && (
          <>
            <ContextMenuGroup>
              <ContextMenuLabel>Add a Tag</ContextMenuLabel>
              {data.map((tag) => (
                <ContextMenuItem key={tag.id}>
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

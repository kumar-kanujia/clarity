import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useMatch } from "@tanstack/react-router"

import {
  Aperture,
  FolderPlus,
  Heart,
  ImagePlusIcon,
  Settings,
  TagIcon,
  TagsIcon,
  Trash2
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { useUploadImage } from "@/features/gallery/hooks/use-upload-image"
import { getTopQueryOptions } from "@/features/tags/hooks"

export const AppSidebar = ({}: React.ComponentProps<typeof Sidebar>) => {
  const { mutate } = useUploadImage()

  const tagQueryOption = getTopQueryOptions()

  const { data, isSuccess } = useQuery(tagQueryOption)

  const { pathname } = useLocation()

  const match = useMatch({
    from: "/tags/$tagid",
    shouldThrow: false
  })

  return (
    <Sidebar collapsible="icon" variant="floating" className="select-none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between overflow-hidden ps-0.5">
              <div className="flex items-center gap-3 ps-0">
                <Avatar>
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold tracking-tight truncate">
                  Clarity /
                </span>
              </div>
              <KbdGroup className="opacity-70 group-hover:opacity-100 transition-opacity">
                <Kbd className="h-5 px-1.5 text-xs">⌘</Kbd>
                <span className="text-xs text-muted-foreground">+</span>
                <Kbd className="h-5 px-1.5 text-xs">B</Kbd>
              </KbdGroup>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/">
                <SidebarMenuButton
                  tooltip={"Gallery"}
                  isActive={pathname === "/"}
                >
                  <Aperture />
                  <p className="text-nowrap">Gallery</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/favorites">
                <SidebarMenuButton
                  tooltip={"Favorites"}
                  isActive={pathname === "/favorites"}
                >
                  <Heart />
                  <p className="text-nowrap">Favorites</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/tags">
                <SidebarMenuButton
                  tooltip={"Tags"}
                  isActive={pathname === "/tags"}
                >
                  <TagsIcon />
                  <p className="text-nowrap">Tags</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {isSuccess && (
          <SidebarGroup>
            <SidebarMenu>
              {data.map((tag) => (
                <SidebarMenuItem key={tag.id}>
                  <Link
                    to={`/tags/$tagid`}
                    params={{ tagid: `${tag.id}` }}
                    style={{ color: tag.tagColor }}
                    activeProps={{
                      style: { color: "white", backgroundColor: tag.tagColor }
                    }}
                  >
                    <SidebarMenuButton
                      tooltip={tag.tagName}
                      isActive={match?.params.tagid === `${tag.id}`}
                    >
                      <TagIcon />
                      <p className="text-nowrap">{tag.tagName}</p>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="border-t pt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Add Image"}
              onClick={() => mutate("file")}
            >
              <ImagePlusIcon />
              <p className="text-nowrap">Add Image</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Add Folder"}
              onClick={() => mutate("directory")}
            >
              <FolderPlus />
              <p className="text-nowrap">Add Folder</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="pt-2 border-t">
          <SidebarMenuItem>
            <Link to="/bin">
              <SidebarMenuButton tooltip={"Bin"} isActive={pathname === "/bin"}>
                <Trash2 />
                <p className="text-nowrap">Bin</p>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/settings">
              <SidebarMenuButton
                tooltip={"Settings"}
                isActive={pathname === "/settings"}
              >
                <Settings />
                <p className="text-nowrap">Settings</p>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

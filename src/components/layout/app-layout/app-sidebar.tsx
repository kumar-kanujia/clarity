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
import { Link } from "@tanstack/react-router"
import {
  Aperture,
  FolderPlus,
  Heart,
  ImagePlusIcon,
  Settings,
  TagIcon,
  Trash2
} from "lucide-react"

export const AppSidebar = ({}: React.ComponentProps<typeof Sidebar>) => {
  const { mutate } = useUploadImage()

  return (
    <Sidebar collapsible="icon" variant="floating" className="py-2 select-none">
      <SidebarHeader className=" h-12 mb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex cursor-default  items-center justify-between rounded-lg overflow-hidden ps-0.5">
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
                <SidebarMenuButton tooltip={"Gallery"}>
                  <Aperture />
                  <p className="text-nowrap">Gallery</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/favorites">
                <SidebarMenuButton tooltip={"Favorites"}>
                  <Heart />
                  <p className="text-nowrap">Favorites</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/tags">
                <SidebarMenuButton tooltip={"Tags"}>
                  <TagIcon />
                  <p className="text-nowrap">Tags</p>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
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
              <SidebarMenuButton tooltip={"Bin"}>
                <Trash2 />
                <p className="text-nowrap">Bin</p>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/settings">
              <SidebarMenuButton tooltip={"Settings"}>
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

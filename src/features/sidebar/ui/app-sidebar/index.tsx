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
import { Aperture, FolderPlus, ImagePlusIcon, Settings } from "lucide-react"

export const AppSidebar = ({}: React.ComponentProps<typeof Sidebar>) => {
  const uploadImage = useUploadImage()

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        className="py-2 select-none"
      >
        <SidebarHeader className="border-b h-12 mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex cursor-default  items-center justify-between rounded-lg overflow-hidden ps-0.5">
                <div className="flex items-center gap-3 ps-0">
                  <Avatar>
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold tracking-tight truncate">
                    Clarity
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
                    <Aperture /> Gallery
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Add Image"}
                onClick={() => uploadImage("file")}
              >
                <ImagePlusIcon />
                Add Image
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Add Folder"}
                onClick={() => uploadImage("directory")}
              >
                <FolderPlus /> Add Folder
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/settings">
                <SidebarMenuButton tooltip={"Settings"}>
                  <Settings /> Settings
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}

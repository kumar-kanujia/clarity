import { Link, useLocation, useMatch } from "@tanstack/react-router"
import {
  Aperture,
  BookmarkX,
  HeartIcon,
  TagIcon,
  Tags,
  Trash
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar"

import { AddImageButton } from "@/features/images/components"
import { getTopQueryOptions } from "@/features/tags/queries"
import { useQuery } from "@tanstack/react-query"

export const AppSidebar = () => {
  const { pathname } = useLocation()

  const tagQueryOption = getTopQueryOptions()

  const { data, isSuccess } = useQuery(tagQueryOption)

  const match = useMatch({
    from: "/tags/$tagid",
    shouldThrow: false
  })

  return (
    <Sidebar>
      <div
        className="h-8 flex items-center justify-end px-2 mb-2"
        data-tauri-drag-region
      >
        <AddImageButton />
        <SidebarTrigger variant="ghost" size="icon-sm" />
      </div>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/" />}
              isActive={pathname === "/"}
            >
              <Aperture /> <p className="text-nowrap">All</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/favorites" />}
              isActive={pathname === "/favorites"}
            >
              <HeartIcon /> <p className="text-nowrap">Favorites</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/untagged" />}
              isActive={pathname === "/untagged"}
            >
              <BookmarkX /> <p className="text-nowrap">Untagged</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/tags" />}
              isActive={pathname === "/tags"}
            >
              <Tags /> <p className="text-nowrap">Tags</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/trash" />}
              isActive={pathname === "/trash"}
            >
              <Trash /> <p className="text-nowrap">Trash</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isSuccess && (
          <>
            <SidebarSeparator />
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
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

import { Home, Inbox, Settings, FolderPlus, ImagePlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useGalleryStore } from "@/hooks/use-gallery-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Menu items.
const items = [
  {
    title: "Library",
    url: "/",
    icon: Home,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { importImages, importFolder } = useGalleryStore();

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0 bg-transparent">
      <SidebarContent className="bg-background/80 backdrop-blur-xl border-r border-white/5 pt-6 px-3 flex flex-col h-full">
        {/* Logo Section */}
        <SidebarGroup>
          <div
            className={cn(
              "px-2 mb-6 flex items-center gap-3 transition-all duration-300",
              isCollapsed ? "justify-center" : "px-4",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 rounded-lg bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            </div>
            <span className="font-black text-xl tracking-tight group-data-[collapsible=icon]:hidden">
              Clarity
            </span>
          </div>

          {/* Import Actions - Toolbar Style */}
          <div
            className={cn(
              "grid gap-2 mb-8 transition-all duration-300",
              isCollapsed ? "px-0" : "px-2",
            )}
          >
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start gap-2 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 transition-all",
                isCollapsed ? "px-0 justify-center w-10 mx-auto" : "",
              )}
              onClick={importImages}
              title="Import Images"
            >
              <ImagePlus className="w-4 h-4" />
              {!isCollapsed && <span>Import Images</span>}
            </Button>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start gap-2 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 transition-all",
                isCollapsed ? "px-0 justify-center w-10 mx-auto" : "",
              )}
              onClick={importFolder}
              title="Import Folder"
            >
              <FolderPlus className="w-4 h-4" />
              {!isCollapsed && <span>Import Folder</span>}
            </Button>
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-12 rounded-2xl transition-all duration-300 font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                          : "hover:bg-white/5 hover:pl-4",
                      )}
                    >
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3",
                          isCollapsed ? "justify-center" : "",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            isActive ? "text-white" : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            isActive ? "text-white" : "",
                            "group-data-[collapsible=icon]:hidden",
                          )}
                        >
                          {item.title}
                        </span>
                        {isActive && !isCollapsed && (
                          <motion.div
                            layoutId="active-pill"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto pb-8 px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings"
                className={cn(
                  "h-12 rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors",
                  isCollapsed ? "justify-center" : "justify-start",
                )}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

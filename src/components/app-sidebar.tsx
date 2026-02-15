import {
  Home,
  Settings,
  Scan,
  Tag,
  ImagePlus,
  FolderPlus,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useGalleryStore } from "@/hooks/use-gallery-store";
import { cn } from "@/lib/utils";

// Menu items.
const items = [
  {
    title: "Library",
    url: "/",
    icon: Home,
  },
  {
    title: "Scans",
    url: "/scans",
    icon: Scan,
  },
  {
    title: "Tags",
    url: "/tags",
    icon: Tag,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { importImages, importFolder, systemTags, userTags, fetchTags } =
    useGalleryStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <Sidebar
      collapsible="none"
      className="w-16 border-r border-white/5 bg-zinc-950 flex flex-col items-center py-4 z-50"
    >
      <SidebarContent className="flex flex-col items-center gap-4 w-full h-full bg-transparent">
        {/* Navigation Items */}
        <div className="flex flex-col gap-2 w-full px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} className="list-none w-full">
                <Link
                  to={item.url}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
                  )}
                  title={item.title}
                >
                  <item.icon className="w-6 h-6 shrink-0" />
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </div>

        <div className="mt-4 w-10 h-px bg-white/5 mx-auto" />

        {/* System Tags */}
        <div className="flex flex-col gap-2 w-full px-2">
          {systemTags.map((tag) => {
            const Icon =
              tag.tagName.toLowerCase() === "favorite" ? Star : Trash2;
            return (
              <SidebarMenuItem key={tag.id} className="list-none w-full">
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 group relative"
                  title={`${tag.tagName} (${tag.imageCount})`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                </button>
              </SidebarMenuItem>
            );
          })}
        </div>

        {systemTags.length > 0 && (
          <div className="mt-4 w-10 h-px bg-white/5 mx-auto" />
        )}

        {/* User Tags */}
        <div className="flex flex-col gap-2 w-full px-2 overflow-y-auto max-h-[30vh] custom-scrollbar">
          {userTags.map((tag) => (
            <SidebarMenuItem key={tag.id} className="list-none w-full">
              <button
                className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/5 transition-all duration-200 group relative"
                title={`${tag.tagName} (${tag.imageCount})`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ backgroundColor: tag.tagColor }}
                />
              </button>
            </SidebarMenuItem>
          ))}
        </div>

        <div className="mt-4 w-10 h-px bg-white/5 mx-auto" />

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 w-full px-2 mt-2">
          <button
            onClick={importImages}
            className="flex items-center justify-center w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 group"
            title="Import Images"
          >
            <ImagePlus className="w-6 h-6" />
          </button>
          <button
            onClick={importFolder}
            className="flex items-center justify-center w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 group"
            title="Import Folder"
          >
            <FolderPlus className="w-6 h-6" />
          </button>
        </div>

        {/* Settings at Bottom */}
        <div className="mt-auto flex flex-col gap-2 w-full px-2 pb-4">
          <Link
            to="/settings"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group",
              location.pathname === "/settings"
                ? "text-primary bg-primary/10"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
            )}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

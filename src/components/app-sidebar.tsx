import {
  Home,
  Settings,
  Scan,
  Tag,
  ImagePlus,
  FolderPlus,
  Heart,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useGalleryStore } from "@/hooks/use-gallery-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="none"
        className="w-20 border-r bg-background/50 backdrop-blur-xl flex flex-col items-center py-6 z-50 transition-all duration-500"
      >
        <SidebarContent className="flex flex-col items-center gap-8 w-full h-full bg-transparent">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-3xl bg-primary flex items-center justify-center p-0.5 shadow-2xl shadow-primary/30 cursor-pointer"
          >
            <div className="w-full h-full rounded-2xl border-2 border-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm tracking-tighter">
                CL
              </span>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-6 w-full px-3">
            {/* Main Navigation */}
            <div className="flex flex-col gap-3 w-full">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="list-none w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center justify-center w-full aspect-square rounded-4xl transition-all duration-300 group relative",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute -right-3 w-1.5 h-6 bg-primary rounded-l-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="font-black uppercase tracking-widest text-[10px] bg-foreground text-background border-none px-3 py-1.5 rounded-lg shadow-2xl"
                      >
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </div>

            <Separator className="w-8 opacity-50" />

            {/* System Special Tags */}
            <div className="flex flex-col gap-3 w-full">
              <AnimatePresence>
                {systemTags.map((tag) => {
                  const Icon =
                    tag.tagName.toLowerCase() === "favorite" ? Heart : Trash2;
                  const isFav = tag.tagName.toLowerCase() === "favorite";
                  return (
                    <SidebarMenuItem key={tag.id} className="list-none w-full">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "flex items-center justify-center w-full aspect-square rounded-4xl transition-all duration-300 group relative",
                              isFav
                                ? "text-red-500 hover:bg-red-500/10"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5 shrink-0",
                                isFav && tag.imageCount > 0 && "fill-current",
                              )}
                            />
                            {tag.imageCount > 0 && (
                              <span
                                className={cn(
                                  "absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[8px] font-black animate-in zoom-in duration-300",
                                  isFav
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                    : "bg-primary text-primary-foreground",
                                )}
                              >
                                {tag.imageCount}
                              </span>
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="font-black uppercase tracking-widest text-[10px] bg-foreground text-background border-none px-3 py-1.5 rounded-lg"
                        >
                          {tag.tagName}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </AnimatePresence>
            </div>

            <Separator className="w-8 opacity-50" />

            {/* Custom Labels Scroll */}
            {userTags.length > 0 && (
              <>
                <Separator className="w-8 opacity-50" />
                <div className="flex flex-col gap-3 w-full max-h-[25vh] overflow-y-auto px-1 py-1 custom-scrollbar no-scrollbar">
                  {userTags.map((tag) => (
                    <SidebarMenuItem key={tag.id} className="list-none w-full">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-full aspect-square rounded-2xl hover:bg-muted/50 transition-all duration-300 group relative"
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full border shadow-sm group-hover:shadow-md transition-all duration-500"
                              style={{ backgroundColor: tag.tagColor }}
                            />
                            {tag.imageCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-background border text-[8px] font-black text-foreground shadow-sm">
                                {tag.imageCount}
                              </span>
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="font-bold uppercase tracking-widest text-[10px] bg-foreground text-background border-none px-3 py-1.5 rounded-lg"
                        >
                          {tag.tagName}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Actions Stack */}
          <div className="mt-auto flex flex-col items-center gap-4 w-full px-3 pb-2">
            <div className="flex flex-col gap-2 w-full bg-muted/30 rounded-4xl p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={importImages}
                    className="w-full aspect-square rounded-2xl text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all duration-300"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-bold uppercase tracking-widest text-[10px]"
                >
                  Import Images
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={importFolder}
                    className="w-full aspect-square rounded-2xl text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all duration-300"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-bold uppercase tracking-widest text-[10px]"
                >
                  Import Folder
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-300 group",
                    location.pathname === "/settings"
                      ? "bg-muted text-foreground shadow-inner"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-bold uppercase tracking-widest text-[10px]"
              >
                Settings
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}

import {
  Home,
  Settings,
  Scan,
  Tag,
  ImagePlus,
  FolderPlus,
  Trash2,
  PanelLeftOpen,
  BrainCircuit,
  Map as MapIcon,
  BarChart3,
  Calendar,
  Users,
  Shield,
} from "lucide-react";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useImportStore } from "@/features/import/hooks/use-import-store";
import { useUiStore } from "@/features/ui/hooks/use-ui-store";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";
import { useImageStore } from "@/features/gallery/hooks/use-image-store";

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
  {
    title: "AI Hub",
    url: "/ai-features",
    icon: BrainCircuit,
  },
  {
    title: "Maps",
    url: "/map-view",
    icon: MapIcon,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart3,
  },
  {
    title: "Timeline",
    url: "/timeline",
    icon: Calendar,
  },
  {
    title: "People",
    url: "/people",
    icon: Users,
  },
  {
    title: "Vault",
    url: "/vault",
    icon: Shield,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { importImages, importFolder } = useImportStore();
  const { isPanelCollapsed, togglePanel } = useUiStore();
  const { systemTags, setCurrentTagId, currentTagId } = useTagStore();
  const { loadImages } = useImageStore();

  const trashTag = systemTags.find((t) => t.tagName.toLowerCase() === "trash");

  const handleTrashClick = async () => {
    if (trashTag) {
      setCurrentTagId(trashTag.id);
      await loadImages(true);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="none"
        className="w-20 border-r bg-zinc-950/20 backdrop-blur-3xl flex flex-col items-center py-8 z-50 transition-all duration-500"
      >
        <SidebarContent className="flex flex-col items-center gap-10 w-full h-full bg-transparent">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center p-0.5 shadow-2xl shadow-primary/40 cursor-pointer group"
          >
            <div className="w-full h-full rounded-xl border border-white/20 flex items-center justify-center bg-primary transition-colors group-hover:bg-primary/90">
              <span className="text-primary-foreground font-black text-[12px] tracking-tighter">
                CL
              </span>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-8 w-full px-3">
            {/* Main Navigation */}
            <div className="flex flex-col gap-4 w-full">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <div key={item.title} className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-500 relative",
                            isActive
                              ? "bg-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                              : "text-zinc-500 hover:text-white hover:bg-white/5",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "w-5 h-5 shrink-0",
                              isActive && "scale-110",
                            )}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="font-black uppercase tracking-widest text-[9px] bg-white text-zinc-950 border-none px-3 py-1.5 rounded-lg shadow-2xl"
                      >
                        {item.title}
                      </TooltipContent>
                    </Tooltip>

                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-lg shadow-primary/50"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Panel Toggle (Mobile/Collapsed style) */}
              {isPanelCollapsed && (
                <div className="relative group">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePanel}
                        className="w-full aspect-square rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5"
                      >
                        <PanelLeftOpen className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="font-bold uppercase tracking-widest text-[9px]"
                    >
                      Open Panel
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <Separator className="w-8 opacity-20" />

            {/* Trash Button */}
            <div className="relative group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTrashClick}
                    className={cn(
                      "w-full aspect-square rounded-2xl transition-all duration-300",
                      currentTagId === trashTag?.id
                        ? "bg-red-500/10 text-red-500"
                        : "text-zinc-500 hover:text-red-400 hover:bg-red-500/5",
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-bold uppercase tracking-widest text-[9px]"
                >
                  Trash Bin
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 w-full bg-zinc-900/40 rounded-3xl p-2 border border-white/5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={importImages}
                    className="w-full aspect-square rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white hover:scale-105 transition-all"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-bold uppercase tracking-widest text-[9px]"
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
                    className="w-full aspect-square rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white hover:scale-105 transition-all"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-bold uppercase tracking-widest text-[9px]"
                >
                  Import Folder
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Bottom Settings */}
          <div className="mt-auto pb-4 px-3 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={cn(
                    "flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-500 group",
                    location.pathname === "/settings"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-black uppercase tracking-widest text-[9px]"
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

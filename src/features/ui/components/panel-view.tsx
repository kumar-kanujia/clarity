import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Search,
  Zap,
  Check,
  Hash,
  Tag as TagIcon,
  Layers,
  Heart,
  Plus,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";
import { useImageStore } from "@/features/gallery/hooks/use-image-store";
import { useUiStore } from "@/features/ui/hooks/use-ui-store";
import { useEffect, useState } from "react";

export function PanelView() {
  const location = useLocation();
  const {
    userTags,
    systemTags,
    currentTagId,
    setCurrentTagId,
    fetchTags,
    createTag,
  } = useTagStore();
  const { loadImages } = useImageStore();
  const { isPanelCollapsed, togglePanel } = useUiStore();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const isTagsPage = location.pathname === "/tags" || location.pathname === "/";
  const isScansPage = location.pathname === "/scans";

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName);
    setNewTagName("");
    setIsAddingTag(false);
  };

  const handleTagClick = async (tagId: number | null) => {
    setCurrentTagId(tagId);
    await loadImages(true);
  };

  return (
    <AnimatePresence mode="popLayout">
      {!isPanelCollapsed && (
        <motion.div
          key="panel-pane"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 272, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="border-r bg-zinc-950/20 backdrop-blur-3xl flex flex-col h-full overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-7 flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-1.5 px-1 relative">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  {isTagsPage
                    ? "Organization"
                    : isScansPage
                      ? "Discovery"
                      : "Menu"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePanel}
                  className="w-6 h-6 rounded-lg -mr-2 text-zinc-600 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                {isTagsPage
                  ? "Library Tags"
                  : isScansPage
                    ? "Identity Scans"
                    : "Options"}
              </h1>
            </div>

            <Separator className="opacity-10" />

            <ScrollArea className="flex-1 -mx-2 px-2 scrollbar-none">
              <div className="flex flex-col gap-9 pb-12">
                {isTagsPage && (
                  <>
                    {/* System Tags (Shortcuts) */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-3">
                        Global Filters
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTagClick(null)}
                          className={cn(
                            "justify-start gap-4 rounded-2xl h-11 px-4 transition-all group",
                            currentTagId === null
                              ? "bg-white/10 text-white shadow-xl shadow-black/20"
                              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100",
                          )}
                        >
                          <Layers className="w-4 h-4" />
                          <span className="flex-1 text-left text-xs font-bold">
                            All Library
                          </span>
                        </Button>

                        {systemTags.map((tag) => {
                          const isFav =
                            tag.tagName.toLowerCase() === "favorite";
                          const isTrash = tag.tagName.toLowerCase() === "trash";
                          // Skip Trash in Panel, will move to sidebar
                          if (isTrash) return null;

                          const Icon = isFav ? Heart : TagIcon;
                          const isActive = currentTagId === tag.id;

                          return (
                            <Button
                              key={tag.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTagClick(tag.id)}
                              className={cn(
                                "justify-start gap-4 rounded-2xl h-11 px-4 transition-all group",
                                isActive
                                  ? "bg-white/10 text-white shadow-xl shadow-black/20"
                                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "w-4 h-4 transition-transform group-hover:scale-110",
                                  isFav &&
                                    tag.imageCount > 0 &&
                                    "fill-current text-red-500",
                                  isActive && "scale-110",
                                )}
                              />
                              <span className="flex-1 text-left text-xs font-bold">
                                {tag.tagName}
                              </span>
                              {tag.imageCount > 0 && (
                                <span className="text-[10px] font-mono opacity-40">
                                  {tag.imageCount}
                                </span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* User Tags */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          Custom Labels
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsAddingTag(!isAddingTag)}
                          className={cn(
                            "w-5 h-5 rounded-md transition-all",
                            isAddingTag
                              ? "bg-primary text-white rotate-45"
                              : "hover:bg-white/10",
                          )}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isAddingTag && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-1 overflow-hidden"
                          >
                            <div className="flex gap-2 pb-3">
                              <Input
                                placeholder="New label..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleCreateTag()
                                }
                                className="h-9 bg-white/5 border-white/10 text-[11px] rounded-xl focus-visible:ring-primary/30"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={handleCreateTag}
                                className="h-9 px-3 rounded-xl bg-primary text-white font-bold text-[10px]"
                                disabled={!newTagName.trim()}
                              >
                                Add
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col gap-1.5">
                        {userTags.map((tag) => {
                          const isActive = currentTagId === tag.id;
                          return (
                            <Button
                              key={tag.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTagClick(tag.id)}
                              className={cn(
                                "justify-start gap-4 rounded-2xl h-11 px-4 transition-all group",
                                isActive
                                  ? "bg-white/10 text-white shadow-xl shadow-black/20"
                                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform",
                                  isActive && "scale-125 ring-2 ring-white/20",
                                )}
                                style={{ backgroundColor: tag.tagColor }}
                              />
                              <span className="flex-1 text-left text-xs font-bold">
                                {tag.tagName}
                              </span>
                              {tag.imageCount > 0 && (
                                <span className="text-[10px] font-mono opacity-40">
                                  {tag.imageCount}
                                </span>
                              )}
                            </Button>
                          );
                        })}
                        {userTags.length === 0 && (
                          <p className="text-[10px] italic text-zinc-600 px-4 py-3 bg-zinc-900/40 rounded-2xl border border-white/5 mx-1">
                            Create tags in management to start organizing
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {isScansPage && (
                  <>
                    {/* Discovery Options */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-3">
                        Search Scan
                      </span>
                      <div className="px-1">
                        <div className="relative group/search">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within/search:text-primary transition-colors" />
                          <Input
                            placeholder="Filter results..."
                            className="h-10 pl-9 rounded-2xl bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/40 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-3">
                        Match Engine
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start gap-4 rounded-2xl h-11 px-4 text-white bg-white/5"
                        >
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="flex-1 text-left text-xs font-bold">
                            Byte-Matching
                          </span>
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start gap-4 rounded-2xl h-11 px-4 text-zinc-500 hover:text-white hover:bg-white/5 opacity-50"
                          disabled
                        >
                          <Hash className="w-4 h-4" />
                          <span className="flex-1 text-left text-xs font-bold">
                            Visual Hash
                          </span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Panel Footer */}
            <div className="pt-6 mt-auto border-t border-white/5">
              <p className="text-[9px] text-center font-black uppercase tracking-[0.3em] text-zinc-700">
                Clarity Engine v0.1.0
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

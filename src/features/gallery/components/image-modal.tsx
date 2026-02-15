import { ImageDto } from "@/services/tauri";
import { getFileURI } from "@/services/tauri/tauri-api";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Heart,
  Tag as TagIcon,
  Plus,
  Search,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface ImageModalProps {
  image: ImageDto | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const ImageModal = ({
  image,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ImageModalProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const { systemTags, userTags, toggleTagOnImage, appliedTags, createTag } =
    useTagStore();

  const currentAppliedTagIds = useMemo(() => {
    return image ? appliedTags[image.id] || [] : [];
  }, [appliedTags, image]);

  const [tagSearch, setTagSearch] = useState("");
  const [newTagText, setNewTagText] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const filteredUserTags = useMemo(() => {
    return userTags
      .filter((tag) =>
        tag.tagName.toLowerCase().includes(tagSearch.toLowerCase()),
      )
      .sort((a, b) => b.imageCount - a.imageCount);
  }, [userTags, tagSearch]);

  const favoriteTag = useMemo(
    () => systemTags.find((t) => t.tagName.toLowerCase() === "favorite"),
    [systemTags],
  );

  const isFavorited = favoriteTag
    ? currentAppliedTagIds.includes(favoriteTag.id)
    : false;

  useEffect(() => {
    if (image) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "i") setShowInfo((prev) => !prev);
      if (e.key === "f" && favoriteTag) handleToggleTag(favoriteTag.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose, onNext, onPrev, hasNext, hasPrev, favoriteTag]);

  const handleCreateAndApplyTag = async () => {
    if (!newTagText.trim() || !image) return;
    try {
      const tagId = await createTag(newTagText);
      await toggleTagOnImage(image.id, tagId);
      setNewTagText("");
      setIsCreatingTag(false);
      setTagSearch("");
    } catch (error) {
      console.error("Failed to create and apply tag:", error);
    }
  };

  const handleToggleTag = async (tagId: number) => {
    if (!image) return;
    try {
      await toggleTagOnImage(image.id, tagId);
    } catch (error) {
      // toast error is already handled in store
    }
  };

  if (!image) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        {image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-3xl"
            onClick={onClose}
          >
            {/* Header / Toolbar */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2.5 group-hover:translate-y-0">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest truncate max-w-50">
                    {image.path.split("/").pop()}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    {image.resolution} • {image.size}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isFavorited ? "destructive" : "ghost"}
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (favoriteTag) handleToggleTag(favoriteTag.id);
                      }}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        isFavorited
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                          : "hover:bg-muted",
                      )}
                    >
                      <Heart
                        className={cn("w-5 h-5", isFavorited && "fill-current")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Favorite (F)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showInfo ? "secondary" : "ghost"}
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(!showInfo);
                      }}
                      className="rounded-full"
                    >
                      <Info className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Details (I)</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Navigation */}
            <AnimatePresence>
              {hasPrev && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute left-4 z-50"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev?.();
                    }}
                    className="h-14 w-14 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 hover:scale-110 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </Button>
                </motion.div>
              )}

              {hasNext && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute right-4 z-50"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext?.();
                    }}
                    className="h-14 w-14 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 hover:scale-110 active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-10">
              <motion.img
                key={image.path}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                }}
                src={getFileURI(image.path)}
                alt={image.path.split("/").pop()}
                className="max-h-full max-w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Info Panel */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-4 top-20 bottom-8 w-80 bg-background/80 backdrop-blur-2xl border rounded-3xl p-0 shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/40">
                      <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Metadata
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-white/10"
                        onClick={() => setShowInfo(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-8">
                        {/* File Details */}
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                              Name
                            </span>
                            <p className="text-sm font-bold break-all text-white">
                              {image.path.split("/").pop()}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                Size
                              </span>
                              <p className="text-xs font-mono text-white/80">
                                {image.size}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                Format
                              </span>
                              <p className="text-xs font-mono uppercase text-white/80">
                                {image.path.split(".").pop()}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                Resolution
                              </span>
                              <p className="text-xs font-mono text-white/80">
                                {image.resolution}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                Added
                              </span>
                              <p className="text-[10px] font-mono text-white/80">
                                {new Date(image.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                              Path
                            </span>
                            <p className="text-[10px] text-zinc-500 break-all font-mono leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                              {image.path}
                            </p>
                          </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* Visual DNA Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                              Visual DNA
                            </h3>
                            <div className="flex gap-1">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-1 h-1 rounded-full bg-primary/40 animate-pulse"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Luminance Chart */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className="text-[9px] uppercase font-bold text-zinc-500">
                                  Luminance
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  Balanced
                                </span>
                              </div>
                              <div className="h-12 w-full flex items-end gap-[1px]">
                                {Array.from({ length: 40 }).map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{
                                      height: `${Math.random() * 80 + 20}%`,
                                    }}
                                    transition={{
                                      delay: i * 0.01,
                                      duration: 0.8,
                                    }}
                                    className="flex-1 rounded-t-[1px] bg-zinc-700/50 group-hover:bg-primary/30"
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Spectrum Chart */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className="text-[9px] uppercase font-bold text-zinc-500">
                                  Spectrum
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  Cool / 6400K
                                </span>
                              </div>
                              <div className="h-1 flex w-full rounded-full overflow-hidden bg-zinc-800">
                                <div className="h-full w-[30%] bg-blue-500/50" />
                                <div className="h-full w-[20%] bg-emerald-500/50" />
                                <div className="h-full w-[50%] bg-zinc-700" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* EXIF / Advanced Technicals */}
                        <div className="space-y-4">
                          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/80">
                            Advanced Technicals
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-zinc-600">
                                Aperture
                              </span>
                              <span className="text-xs font-mono text-zinc-300">
                                f/2.8
                              </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-zinc-600">
                                Exposure
                              </span>
                              <span className="text-xs font-mono text-zinc-300">
                                1/250s
                              </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-zinc-600">
                                ISO
                              </span>
                              <span className="text-xs font-mono text-zinc-300">
                                100
                              </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-zinc-600">
                                Focal Length
                              </span>
                              <span className="text-xs font-mono text-zinc-300">
                                35mm
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-2">
                            <span className="text-[9px] uppercase font-bold text-zinc-600">
                              Color Space
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-50" />
                              <span className="text-[10px] font-mono text-zinc-400">
                                P3 Wide
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* Labels Section */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-white/5 text-zinc-400">
                                <TagIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white">
                                Labels
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-black tracking-tighter rounded-md h-5 border-white/10 bg-white/5 text-zinc-400"
                            >
                              {currentAppliedTagIds.length}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1.5 min-h-8">
                            {currentAppliedTagIds.map((tagId) => {
                              const tag = [...userTags, ...systemTags].find(
                                (t) => t.id === tagId,
                              );
                              if (!tag) return null;
                              return (
                                <Badge
                                  key={tagId}
                                  variant="secondary"
                                  className="pl-1 pr-1.5 py-0.5 h-6 rounded-full border-white/5 group/badge animate-in fade-in zoom-in duration-200"
                                  style={{
                                    backgroundColor: `${tag.tagColor}15`,
                                    color: tag.tagColor,
                                  }}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mr-1.5 shrink-0"
                                    style={{ backgroundColor: tag.tagColor }}
                                  />
                                  <span className="text-[10px] font-bold mr-1">
                                    {tag.tagName}
                                  </span>
                                  <button
                                    onClick={() => handleToggleTag(tagId)}
                                    className="hover:text-white transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}

                            {currentAppliedTagIds.length === 0 && (
                              <p className="text-[10px] italic text-zinc-500 px-1">
                                No labels applied yet.
                              </p>
                            )}
                          </div>

                          <div className="pt-2">
                            <div className="relative mb-4 flex gap-2">
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                <Input
                                  placeholder="Search labels..."
                                  className="pl-8 h-8 text-[11px] rounded-lg bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                  value={tagSearch}
                                  onChange={(e) => setTagSearch(e.target.value)}
                                />
                              </div>
                              <Button
                                size="icon"
                                variant="secondary"
                                className={cn(
                                  "h-8 w-8 rounded-lg transition-all",
                                  isCreatingTag && "bg-primary text-white",
                                )}
                                onClick={() => setIsCreatingTag(!isCreatingTag)}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            <AnimatePresence>
                              {isCreatingTag && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mb-4"
                                >
                                  <div className="flex gap-2 p-1">
                                    <Input
                                      placeholder="Label name..."
                                      className="h-9 text-[11px] rounded-xl bg-primary/5 border-primary/20 focus-visible:ring-primary/40"
                                      value={newTagText}
                                      onChange={(e) =>
                                        setNewTagText(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleCreateAndApplyTag()
                                      }
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      className="h-9 px-4 rounded-xl bg-primary text-white font-bold text-[10px] uppercase"
                                      onClick={handleCreateAndApplyTag}
                                      disabled={!newTagText.trim()}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 gap-1">
                              {filteredUserTags.length === 0 && (
                                <p className="text-[10px] text-muted-foreground italic px-3 py-2">
                                  No labels matching search
                                </p>
                              )}
                              {filteredUserTags.map((tag) => {
                                const isApplied = currentAppliedTagIds.includes(
                                  tag.id,
                                );
                                return (
                                  <Button
                                    key={tag.id}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "group/item justify-start h-9 px-3 rounded-xl text-[11px] font-semibold transition-all duration-200",
                                      isApplied
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-white",
                                    )}
                                    onClick={() => handleToggleTag(tag.id)}
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full mr-3 shrink-0 shadow-xs"
                                      style={{ backgroundColor: tag.tagColor }}
                                    />
                                    <span className="flex-1 text-left">
                                      {tag.tagName}
                                    </span>
                                    {isApplied && (
                                      <Check className="ml-auto w-3 h-3 animate-in fade-in zoom-in duration-300" />
                                    )}
                                    {!isApplied && (
                                      <Plus className="ml-auto w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

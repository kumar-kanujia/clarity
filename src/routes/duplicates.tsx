import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image as ImageType } from "@/types";
import { getImagesGroupedByHash } from "@/tauri/tauri-commands";
import { Copy, CheckCircle2, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { convertFileSrc } from "@tauri-apps/api/core";

export const Route = createFileRoute("/duplicates")({
  component: DuplicatesPage,
});

function DuplicatesPage() {
  const [groups, setGroups] = useState<ImageType[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getImagesGroupedByHash();
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">
          Analyzing your library for duplicates...
        </p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            No Duplicates Found
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Your library is clean! We couldn't find any images with matching
            hashes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Duplicate Finder</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Info className="w-4 h-4" />
          Found {groups.length} groups of similar images. The first image in
          each group is kept as original.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-12 pb-10">
        {groups.map((group, groupIndex) => (
          <motion.section
            key={groupIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                Group {groupIndex + 1} • {group.length} Items
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {group.map((image, imgIndex) => {
                const isOriginal = imgIndex === 0;
                return (
                  <div
                    key={image.filePath}
                    className="relative group rounded-3xl overflow-hidden bg-secondary/30 border border-white/5 aspect-square transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10"
                  >
                    <img
                      src={convertFileSrc(image.filePath)}
                      alt={image.fileName}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge */}
                    <div
                      className={cn(
                        "absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter backdrop-blur-md border",
                        isOriginal
                          ? "bg-primary/80 border-primary/20 text-white shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                          : "bg-black/60 border-white/10 text-white/80",
                      )}
                    >
                      {isOriginal ? "Original" : "Duplicate"}
                    </div>

                    {/* Floating Info */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-[10px] font-medium text-white/60 truncate bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                        {image.fileName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}

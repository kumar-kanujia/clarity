import { Image } from "@/types";
import { getFileURI } from "@/tauri/tauri-api";
import { Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";

interface ImageGridProps {
  images: Image[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPreview: (image: Image) => void;
}

export const ImageGrid = ({
  images,
  isLoading,
  hasMore,
  onLoadMore,
  onPreview,
}: ImageGridProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10 mt-6">
      <AnimatePresence mode="popLayout">
        {images.map((image, idx) => (
          <div key={image.path + idx} className="flex flex-col group">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.5,
                delay: 0.02,
              }}
              className="relative rounded-3xl overflow-hidden border border-white/5 bg-secondary/10 aspect-square shadow-md transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-2 group-hover:rotate-1"
            >
              <img
                src={getFileURI(image.path)}
                alt={image.filename}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Hover Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(image);
                }}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:scale-110 z-10 border border-white/20 shadow-2xl cursor-pointer"
                title="View Full Size"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </motion.div>
            {/* Details below image */}
            <div className="mt-4 px-2 space-y-1 transition-all duration-500 group-hover:translate-x-1">
              <p className="text-xs font-black text-foreground truncate tracking-tight">
                {image.filename}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  {image.size}
                </p>
                <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  {image.resolution || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </AnimatePresence>

      {/* Loading Skeletons */}
      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex flex-col space-y-4">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-2 px-2">
              <Skeleton className="h-3 w-3/4 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-2 w-8 rounded-full" />
                <Skeleton className="h-2 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}

      {/* Sentinel for Intersection Observer */}
      <div ref={loaderRef} className="col-span-full h-10 w-full" />
    </div>
  );
};

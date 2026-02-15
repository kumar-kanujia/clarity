import { ImageDto } from "@/app";
import { getFileURI } from "@/services/tauri/tauri-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize2, MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

interface ImageGridProps {
  images: ImageDto[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPreview: (image: ImageDto) => void;
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
    <div className="pb-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        <AnimatePresence mode="popLayout">
          {images.map((image, idx) => (
            <motion.div
              layout
              key={image.path + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
                delay: Math.min(idx * 0.01, 0.2),
              }}
              className="group relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                <img
                  src={getFileURI(image.thumbnailPath || image.path)}
                  alt={image.path.split("/").pop()}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-zinc-950/40 transition-colors duration-300" />

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(image);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-black transition-colors"
                    title="Maximize"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 rounded-xl bg-zinc-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-black transition-colors"
                    title="Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Panel subtle */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-white">
                  <p className="text-[10px] text-white/50 font-mono truncate">
                    {image.path.split("/").pop()}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                      {image.resolution}
                    </span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                      {image.size}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="aspect-square">
              <Skeleton className="w-full h-full rounded-2xl bg-zinc-900" />
            </div>
          ))}
        </div>
      )}

      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  );
};

import { ImageDto } from '@/app';
import { getFileURI } from '@/app/tauri-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Maximize2, MoreHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

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
  onPreview
}: ImageGridProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          hasMore
        ) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className="pb-20 mt-6 px-4">
      {/* Standard Grid Layout for Performance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {images.map((image, idx) => (
            <motion.div
              layout
              key={image.path + idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.2,
                delay: Math.min(idx * 0.02, 0.3)
              }}
              className="group relative aspect-square"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/20 shadow-sm hover:shadow-xl transition-all duration-300 dark:bg-zinc-900/50">
                <img
                  src={getFileURI(
                    image.thumbnailPath || image.path
                  )}
                  alt={image.path.split('/').pop()}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  style={{ display: 'block' }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Hover Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onPreview(image);
                    }}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors shadow-lg"
                    title="Maximize"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors shadow-lg"
                    title="More"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Info on Hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium truncate">
                    {image.path.split('/').pop()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/70 uppercase tracking-wider">
                      {image.resolution}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="text-[10px] text-white/70 uppercase tracking-wider">
                      {image.size}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="aspect-square"
            >
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for Intersection Observer */}
      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  );
};

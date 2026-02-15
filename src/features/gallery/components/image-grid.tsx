import { ImageDto } from "@/services/tauri";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { ImageCard } from "./image-card";
import { useGalleryStore } from "@/hooks/use-gallery-store";

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
  const { systemTags } = useGalleryStore();

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
            <ImageCard
              key={image.path + idx}
              image={image}
              index={idx}
              onPreview={onPreview}
              systemTags={systemTags}
            />
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="aspect-square">
              <Skeleton className="w-full h-full rounded-2xl bg-muted" />
            </div>
          ))}
        </div>
      )}

      <div ref={loaderRef} className="h-20 w-full" />
    </div>
  );
};

import { ImageDto } from "@/app";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, X, Home } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ImageModal } from "@/components/elements/image-modal";
import { ImageGrid } from "@/features/gallery/components/image-grid";
import { useGalleryStore } from "@/hooks/use-gallery-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    images,
    isLoading,
    hasMore,
    loadImages,
    importSummary,
    clearImportSummary,
  } = useGalleryStore();

  const [previewImage, setPreviewImage] = useState<ImageDto | null>(null);

  // Initial load
  useEffect(() => {
    loadImages(true);
  }, []);

  const handleNextImage = async () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.path === previewImage.path,
    );

    if (currentIndex < images.length - 1) {
      setPreviewImage(images[currentIndex + 1]);
    } else if (hasMore && !isLoading) {
      await loadImages(false);
      const updatedImages = useGalleryStore.getState().images;
      const newCurrentIndex = updatedImages.findIndex(
        (img) => img.path === previewImage.path,
      );
      if (newCurrentIndex < updatedImages.length - 1) {
        setPreviewImage(updatedImages[newCurrentIndex + 1]);
      }
    }
  };

  const handlePrevImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.path === previewImage.path,
    );
    if (currentIndex > 0) {
      setPreviewImage(images[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Subtle Import Status */}
      <AnimatePresence>
        {importSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-zinc-900/90 border border-white/5 shadow-2xl backdrop-blur-xl rounded-2xl py-2 px-4 flex items-center gap-4 pointer-events-auto">
              <span className="text-xs font-medium text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Synchronized {importSummary.totalImported} new images
              </span>
              <button
                onClick={clearImportSummary}
                className="text-zinc-500 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!isLoading && images.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8 text-zinc-400">
            <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <Home className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">
              Your library is empty
            </h2>
            <p className="max-w-sm text-sm">
              Use the sidebar to import your photos and start organizing them
              with Clarity.
            </p>
          </div>
        ) : (
          <div className="px-6 py-6 overflow-hidden">
            <ImageGrid
              images={images}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={() => loadImages(false)}
              onPreview={setPreviewImage}
            />
          </div>
        )}
      </div>

      <ImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        hasNext={
          (!!previewImage &&
            images.findIndex((img) => img.path === previewImage.path) <
              images.length - 1) ||
          hasMore
        }
        hasPrev={
          !!previewImage &&
          images.findIndex((img) => img.path === previewImage.path) > 0
        }
      />
    </div>
  );
}

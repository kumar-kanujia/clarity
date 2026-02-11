import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { EmptyState } from "@/features/gallery/components/empty-state";
import { ImageGrid } from "@/features/gallery/components/image-grid";
import { ImageModal } from "@/features/scanner/components/image-modal";
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
    importImages,
    importFolder,
    clearImportSummary,
  } = useGalleryStore();

  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  // Initial load
  useEffect(() => {
    loadImages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Navigation Logic
  const handleNextImage = async () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.filePath === previewImage.filePath,
    );

    // If next image exists, go to it
    if (currentIndex < images.length - 1) {
      setPreviewImage(images[currentIndex + 1]);
    }
    // If at the end and has more, load more then go to next
    else if (hasMore && !isLoading) {
      await loadImages(false);
      // Re-calculate index after load, logic might need adjustment if state updates are async/batched
      // For simple case, we just rely on user clicking next again or we could try to auto-advance
      // providing the new image exists.
      const updatedImages = useGalleryStore.getState().images;
      const newCurrentIndex = updatedImages.findIndex(
        (img) => img.filePath === previewImage.filePath,
      );
      if (newCurrentIndex < updatedImages.length - 1) {
        setPreviewImage(updatedImages[newCurrentIndex + 1]);
      }
    }
  };

  const handlePrevImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.filePath === previewImage.filePath,
    );
    if (currentIndex > 0) {
      setPreviewImage(images[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-0 animate-in fade-in duration-700">
      {/* Import Summary Alert - Floating or Fixed? Let's make it sticky top or floating */}
      <AnimatePresence>
        {importSummary && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="w-full px-4 pt-4"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-full text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Import Complete</h4>
                  <p className="text-sm text-muted-foreground font-medium">
                    <span className="text-foreground">
                      {importSummary.total}
                    </span>{" "}
                    total selected,{" "}
                    <span className="text-foreground">
                      {importSummary.scanned}
                    </span>{" "}
                    scanned,{" "}
                    <span className="text-foreground">
                      {importSummary.imported}
                    </span>{" "}
                    imported,{" "}
                    <span className="text-yellow-500">
                      {importSummary.skipped}
                    </span>{" "}
                    skipped,{" "}
                    <span className="text-destructive">
                      {importSummary.failed}
                    </span>{" "}
                    failed
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearImportSummary}
                className="rounded-full hover:bg-primary/20"
              >
                <X className="w-5 h-5 opacity-70" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {!isLoading && images.length === 0 ? (
          <EmptyState
            onImportFolder={importFolder}
            onImportImages={importImages}
          />
        ) : (
          <ImageGrid
            images={images}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => loadImages(false)}
            onPreview={setPreviewImage}
          />
        )}
      </div>

      <ImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        hasNext={
          (!!previewImage &&
            images.findIndex((img) => img.filePath === previewImage.filePath) <
              images.length - 1) ||
          hasMore
        }
        hasPrev={
          !!previewImage &&
          images.findIndex((img) => img.filePath === previewImage.filePath) > 0
        }
      />
    </div>
  );
}

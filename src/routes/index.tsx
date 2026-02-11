import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { getSavedImagesBatch, saveImages } from "@/tauri/tauri-commands";
import { selectDirs, selectImages } from "@/tauri/tauri-api";
import { Image, ImportSummary } from "@/types";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { GalleryHeader } from "@/features/gallery/components/gallery-header";
import { EmptyState } from "@/features/gallery/components/empty-state";
import { ImageGrid } from "@/features/gallery/components/image-grid";
import { ImageModal } from "@/features/scanner/components/image-modal";

export const Route = createFileRoute("/")({
  component: Index
});

const BATCH_SIZE = 20;

function Index() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null
  );
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  const loadImages = useCallback(
    async (isReset = false) => {
      if (isLoading && !isReset) return [];

      try {
        setIsLoading(true);
        const currentOffset = isReset ? 0 : offset;
        const newImages = await getSavedImagesBatch(currentOffset, BATCH_SIZE);

        if (newImages.length < BATCH_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (isReset) {
          setImages(newImages);
          setOffset(BATCH_SIZE);
        } else {
          setImages((prev) => [...prev, ...newImages]);
          setOffset((prev) => prev + BATCH_SIZE); // Increment offset
        }
        return newImages;
      } catch (error) {
        console.error("Failed to load library:", error);
        toast.error("Failed to load library images");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [offset, isLoading]
  );

  // Initial load
  useEffect(() => {
    loadImages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleImportImages = async () => {
    try {
      const files = await selectImages();
      if (files && files.length > 0) {
        setIsLoading(true);
        setImportSummary(null);
        const summary = await saveImages(files);
        setImportSummary(summary);
        await loadImages(true); // Reset and reload
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No files selected") {
        console.error("Failed to import images:", error);
        toast.error("Failed to import images");
      }
      setIsLoading(false);
    }
  };

  const handleImportFolder = async () => {
    try {
      const path = await selectDirs();
      if (path) {
        setIsLoading(true);
        setImportSummary(null);
        const summary = await saveImages(path);
        setImportSummary(summary);
        await loadImages(true); // Reset and reload
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No directory selected") {
        console.error("Failed to import folder:", error);
        toast.error("Failed to import folder");
      }
      setIsLoading(false);
    }
  };

  // Navigation Logic
  const handleNextImage = async () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.filePath === previewImage.filePath
    );

    // If next image exists, go to it
    if (currentIndex < images.length - 1) {
      setPreviewImage(images[currentIndex + 1]);
    }
    // If at the end and has more, load more then go to next
    else if (hasMore && !isLoading) {
      const newImages = await loadImages(false);
      if (newImages && newImages.length > 0) {
        setPreviewImage(newImages[0]);
      }
    }
  };

  const handlePrevImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex(
      (img) => img.filePath === previewImage.filePath
    );
    if (currentIndex > 0) {
      setPreviewImage(images[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-4 animate-in fade-in duration-700">
      <GalleryHeader
        onImportFolder={handleImportFolder}
        onImportImages={handleImportImages}
        isLoading={isLoading}
      />

      {/* Import Summary Alert */}
      <AnimatePresence>
        {importSummary && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="w-full"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
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
                onClick={() => setImportSummary(null)}
                className="rounded-full hover:bg-primary/20"
              >
                <X className="w-5 h-5 opacity-70" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
        {!isLoading && images.length === 0 ? (
          <EmptyState
            onImportFolder={handleImportFolder}
            onImportImages={handleImportImages}
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

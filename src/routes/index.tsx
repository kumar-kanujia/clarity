import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSavedImages, saveImages } from "@/tauri/tauri-commands";
import { selectDirs, selectImages, getFileURI } from "@/tauri/tauri-api";
import { Button } from "@/components/ui/button";
import { Image, ImportSummary } from "@/types";
import { toast } from "sonner";
import {
  FolderInput,
  ImagePlus,
  Maximize2,
  X,
  ImageOff,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageModal } from "@/features/scanner/components/image-modal";

export const Route = createFileRoute("/")({
  component: Index
});

function Index() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null
  );
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      const files = await getSavedImages();
      setImages(files);
    } catch (error) {
      console.error("Failed to load library:", error);
      toast.error("Failed to load library images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportImages = async () => {
    try {
      const files = await selectImages();
      if (files && files.length > 0) {
        setIsLoading(true);
        setImportSummary(null); // Clear previous summary
        const summary = await saveImages(files);
        setImportSummary(summary);
        await loadLibrary();
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No files selected") {
        console.error("Failed to import images:", error);
        toast.error("Failed to import images");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFolder = async () => {
    try {
      const path = await selectDirs();
      if (path) {
        setIsLoading(true);
        setImportSummary(null); // Clear previous summary
        const summary = await saveImages(path);
        setImportSummary(summary);
        await loadLibrary();
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "No directory selected") {
        console.error("Failed to import folder:", error);
        toast.error("Failed to import folder");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-4 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-3xl font-black tracking-tight">Library</h2>
          </div>
          <p className="text-muted-foreground font-medium pl-5">
            Manage your collection
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleImportFolder}
            disabled={isLoading}
            className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 font-bold"
          >
            <FolderInput className="mr-2 h-5 w-5" />
            Import Folder
          </Button>
          <Button
            onClick={handleImportImages}
            disabled={isLoading}
            className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20"
          >
            <ImagePlus className="mr-2 h-5 w-5" />
            Import Images
          </Button>
        </div>
      </div>

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

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-4xl bg-secondary/5">
            <div className="p-8 bg-secondary/20 rounded-full mb-6">
              <ImageOff className="w-16 h-16 text-muted-foreground/20" />
            </div>
            <h3 className="text-2xl font-black text-foreground">
              No images yet
            </h3>
            <p className="text-muted-foreground font-medium mt-2 max-w-sm text-center opacity-60">
              Import images or folders to start building your collection.
            </p>
            <div className="flex gap-4 mt-8">
              <Button
                variant="secondary"
                onClick={handleImportFolder}
                className="rounded-xl"
              >
                Import Folder
              </Button>
              <Button onClick={handleImportImages} className="rounded-xl">
                Import Images
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 pb-10">
            <AnimatePresence mode="popLayout">
              {images.map((image, idx) => (
                <div key={image.path} className="flex flex-col group">
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(idx * 0.05, 0.5)
                    }}
                    className="relative rounded-3xl overflow-hidden border border-white/5 bg-secondary/10 aspect-square shadow-md transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1"
                  >
                    <img
                      src={getFileURI(image.path)}
                      alt={image.filename}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Hover Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image);
                      }}
                      className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:scale-110 z-10 border border-white/20 shadow-2xl"
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
          </div>
        )}
      </div>

      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}

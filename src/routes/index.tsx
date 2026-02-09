import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSavedImages, saveImages } from "@/tauri/tauri-commands";
import { selectDirs, selectImages, getFileURI } from "@/tauri/tauri-api";
import { Button } from "@/components/ui/button";
import { Image } from "@/types";
import { toast } from "sonner";
import { FolderInput, ImagePlus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index
});

function Index() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        // files is already string[] (paths)
        await saveImages(files);
        toast.success(`Imported ${files.length} images successfully`);
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
        await saveImages(path);
        toast.success("Folder imported successfully");
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
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Library</h2>
          <p className="text-muted-foreground mt-1">
            Manage and view your imported collection.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleImportFolder}
            disabled={isLoading}
          >
            <FolderInput className="mr-2 h-4 w-4" />
            Import Folder
          </Button>
          <Button onClick={handleImportImages} disabled={isLoading}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Import Images
          </Button>
        </div>
      </div>

      {isLoading && images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading library...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50 p-12">
          <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
            <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium mb-1">No images yet</h3>
          <p className="mb-6 max-w-sm text-center">
            Import images or folders to start building your collection.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleImportFolder}>
              Import Folder
            </Button>
            <Button onClick={handleImportImages}>Import Images</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto pb-4 pr-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-xl overflow-hidden border bg-muted shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20"
            >
              <img
                src={getFileURI(image.path)}
                alt={image.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

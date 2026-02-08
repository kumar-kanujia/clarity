import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveDir, getSavedImages } from "@/tauri/tauri-commands";
import { selectDir } from "@/tauri/tauri-api";
import { Button } from "@/components/ui/button";
import { Image } from "@/types";
import { getFileURI } from "@/tauri/tauri-api";

export const Route = createFileRoute("/")({
  component: Index
});

function Index() {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const files = await getSavedImages();
      setImages(files);
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const path = await selectDir();
      if (path) {
        await saveDir(path);
        await loadImages();
      }
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Library</h3>
        <Button onClick={handleOpenFolder}>Open Folder</Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No images loaded. Open a folder to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={getFileURI(image.path)}
                alt={image.filename}
                className="w-full h-full object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, Image as ImageIcon } from "lucide-react";

import { loadImage, getFileURI } from "./lib/tauri-api";

export default function PhotoGrid() {
  const [images, setImages] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  const handleOpenFolder = () => {
    try {
      loadImage().then(({ folder, loadedPhotos }) => {
        setImages(loadedPhotos);
        setCurrentPath(folder);
      });
    } catch (error) {
      console.error("Failed to load images", error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground p-4 space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Tauri Gallery
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground truncate max-w-75">
            {currentPath || "No folder selected"}
          </span>
          <Button onClick={handleOpenFolder} variant="default">
            <FolderOpen className="mr-2 h-4 w-4" />
            Open Folder
          </Button>
        </div>
      </div>

      {/* Grid Section */}
      {images.length > 0 ? (
        <div className="columns-2 md:columns-4 lg:columns-6 gap-4 space-y-4 pb-10 mx-auto">
          {images.map((photo) => (
            <div className="break-inside-avoid rounded-xl overflow-hidden border bg-muted">
              <img
                src={getFileURI(photo)}
                loading="lazy"
                className="w-full h-auto block" // h-auto maintains aspect ratio
              />
              {/* Optional: Overlay with name */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <ImageIcon className="w-16 h-16 opacity-20" />
          <p>Open a folder to start viewing photos</p>
          <Button variant="outline" onClick={handleOpenFolder}>
            Select Directory
          </Button>
        </div>
      )}
    </div>
  );
}

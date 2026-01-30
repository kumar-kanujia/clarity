import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, Image as ImageIcon } from "lucide-react";

import { loadImage, getFileURI, ImageFile, formatSize } from "./lib/tauri-api";

export default function PhotoGrid() {
  const [images, setImages] = useState<ImageFile[]>([]);
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
            <div
              key={photo.name}
              className="break-inside-avoid relative group rounded-lg overflow-hidden border bg-muted mb-4"
            >
              <img
                src={getFileURI(photo.path)}
                loading="lazy"
                className="w-full h-auto object-cover"
              />

              {/* Metadata Overlay (Appears on Hover) */}
              <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs font-medium truncate">{photo.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-gray-300">
                    {photo.width ? `${photo.width}×${photo.height}` : "Unknown"}
                  </span>
                  <span className="text-[10px] font-mono bg-white/20 px-1 rounded">
                    {formatSize(photo.size_bytes)}
                  </span>
                </div>
              </div>
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

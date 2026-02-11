import { useState } from "react";
import { Image } from "@/types";
import { ImageModal } from "./image-modal";
import { moveToTrash } from "@/tauri/tauri-commands";
import { useGetScannerStore } from "../hooks/use-scanner-store";
import { ResultHeader } from "./result-header";
import { EmptyResult } from "./empty-result";
import { GroupCard } from "./group-card";
import { toast } from "sonner";

/**
 * ScanResult Component
 * Orchestrates the display of scan results using modular components.
 * Manages the deletion process and full-size image preview modal.
 */
export const ScanResult = () => {
  const {
    groups,
    selectedImages,
    setAppState,
    toggleImageSelection,
    deleteImages
  } = useGetScannerStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  /**
   * Handles the deletion of all selected images.
   */
  const handleDelete = async () => {
    if (selectedImages.size === 0) return;

    setIsDeleting(true);
    const imagesToDelete: Image[] = [];
    const deletedPaths: string[] = [];

    groups.forEach((group) => {
      group.forEach((img) => {
        if (selectedImages.has(img.filePath)) {
          imagesToDelete.push(img);
          deletedPaths.push(img.filePath);
        }
      });
    });

    try {
      await moveToTrash(imagesToDelete);
      deleteImages(deletedPaths);
      toast.success(
        `Successfully moved ${deletedPaths.length} images to trash`
      );
    } catch (error) {
      console.error("Failed to delete images:", error);
      toast.error(
        "Failed to delete some images. They may be in use by another program."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const validGroups = groups.filter((g) => g.length > 1);

  return (
    <div className="flex flex-col h-full">
      <ResultHeader
        groupsCount={validGroups.length}
        selectedCount={selectedImages.size}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onBack={() => setAppState("PREVIEW")}
      />

      <div className="flex-1 overflow-y-auto pr-2 space-y-12 pb-20 custom-scrollbar">
        {validGroups.length === 0 ? (
          <EmptyResult />
        ) : (
          validGroups.map((group, idx) => (
            <GroupCard
              key={idx} // In a real app, use a more stable ID if available
              group={group}
              groupIdx={idx}
              selectedImages={selectedImages}
              onToggleSelection={(path) => toggleImageSelection(path, idx)}
              onPreview={(img) => setPreviewImage(img)}
            />
          ))
        )}
      </div>

      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

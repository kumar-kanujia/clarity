import { Button } from "@/components/ui/button";
import { ImageOff } from "lucide-react";

interface EmptyStateProps {
  onImportFolder: () => void;
  onImportImages: () => void;
}

export const EmptyState = ({
  onImportFolder,
  onImportImages,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-4xl bg-secondary/5 mt-8">
      <div className="p-8 bg-secondary/20 rounded-full mb-6">
        <ImageOff className="w-16 h-16 text-muted-foreground/20" />
      </div>
      <h3 className="text-2xl font-black text-foreground">No images yet</h3>
      <p className="text-muted-foreground font-medium mt-2 max-w-sm text-center opacity-60">
        Import images or folders to start building your collection.
      </p>
      <div className="flex gap-4 mt-8">
        <Button
          variant="secondary"
          onClick={onImportFolder}
          className="rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Import Folder
        </Button>
        <Button
          onClick={onImportImages}
          className="rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40"
        >
          Import Images
        </Button>
      </div>
    </div>
  );
};

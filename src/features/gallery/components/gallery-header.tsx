import { Button } from "@/components/ui/button";
import { FolderInput, ImagePlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface GalleryHeaderProps {
  onImportFolder: () => void;
  onImportImages: () => void;
  isLoading: boolean;
}

export const GalleryHeader = ({
  onImportFolder,
  onImportImages,
  isLoading,
}: GalleryHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full transition-all duration-500 hover:h-12" />
          <h2 className="text-3xl font-black tracking-tight">Library</h2>
        </div>
        <p className="text-muted-foreground font-medium pl-5">
          Manage your collection
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onImportFolder}
          disabled={isLoading}
          className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <Spinner className="mr-2 h-5 w-5 text-foreground" />
          ) : (
            <FolderInput className="mr-2 h-5 w-5" />
          )}
          Import Folder
        </Button>
        <Button
          onClick={onImportImages}
          disabled={isLoading}
          className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-primary/40"
        >
          {isLoading ? (
            <Spinner className="mr-2 h-5 w-5 text-primary-foreground" />
          ) : (
            <ImagePlus className="mr-2 h-5 w-5" />
          )}
          Import Images
        </Button>
      </div>
    </div>
  );
};

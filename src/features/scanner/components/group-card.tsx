import { Image } from "@/types";
import { ImageCard } from "./image-card";
import { useGetScannerStore } from "../hooks/use-scanner-store";
import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupCardProps {
  group: Image[];
  groupIdx: number;
  selectedImages: Set<string>;
  onToggleSelection: (path: string) => void;
  onPreview: (image: Image) => void;
}

/**
 * GroupCard Component
 * Wraps a collection of similar images and manages the layout of individual ImageCards.
 */
export const GroupCard = ({
  group,
  groupIdx,
  selectedImages,
  onToggleSelection,
  onPreview
}: GroupCardProps) => {
  if (group.length < 2) return null;

  const { selectAllExceptBest } = useGetScannerStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              Group <span className="text-primary">#{groupIdx + 1}</span>
            </h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
              {group.length} similar images found
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => selectAllExceptBest(groupIdx)}
          className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest h-9 px-4 transition-all"
        >
          <CheckSquare className="w-3.5 h-3.5 mr-2" />
          Select All Except Best
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {group.map((image, idx) => (
          <ImageCard
            key={image.fileName}
            image={image}
            isBest={idx === 0}
            isSelected={selectedImages.has(image.filePath)}
            canToggle={
              selectedImages.has(image.filePath) ||
              group.filter((img) => selectedImages.has(img.filePath)).length <
                group.length - 1
            }
            onToggle={() => onToggleSelection(image.filePath)}
            onPreview={() => onPreview(image)}
          />
        ))}
      </div>

      <div className="h-px bg-white/5 mx-2 pt-4" />
    </div>
  );
};

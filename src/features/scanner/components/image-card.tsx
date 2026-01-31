import { cn } from "@/lib/utils";
import { getFileURI } from "@/tauri/tauri-api";
import { Image } from "@/types";
import { Maximize2, CircleX, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ImageCardProps {
  image: Image;
  isBest: boolean;
  isSelected: boolean;
  canToggle: boolean;
  onToggle: () => void;
  onPreview: () => void;
}

/**
 * ImageCard Component
 * Displays an individual image with selection indicator, 'BEST' badge,
 * and metadata details. Includes bigger images as requested.
 */
export const ImageCard = ({
  image,
  isBest,
  isSelected,
  canToggle,
  onToggle,
  onPreview,
}: ImageCardProps) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected && !canToggle) {
      toast.error("At least one image must remain unselected");
      return;
    }
    onToggle();
  };

  return (
    <div>
      <div
        className={cn(
          "relative group rounded-2xl overflow-hidden border-2 transition-all duration-500 cursor-pointer shadow-sm",
          isSelected
            ? "border-red-500 bg-red-500/5 scale-[0.98]"
            : isBest
              ? "border-green-500/40 shadow-green-500/5 hover:border-green-500"
              : "border-white/5 bg-secondary/20 hover:border-white/20",
        )}
        onClick={handleToggle}
      >
        {/* Selection Indicator & Status */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              isSelected
                ? "bg-red-500 border-red-500"
                : "bg-black/20 border-white/40 backdrop-blur-md",
            )}
          >
            {isSelected && <CircleX className="w-4 h-4 text-white" />}
          </div>

          {isBest && (
            <div className="bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg shadow-green-500/20 flex items-center gap-1.5 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-3 h-3" />
              Best
            </div>
          )}
        </div>

        {/* Image Display - Fully Visible as requested */}
        <div className="aspect-square w-full overflow-hidden bg-black/5 flex items-center justify-center p-2 relative group-hover:p-0 transition-all duration-500">
          <img
            src={getFileURI(image.path)}
            className={cn(
              "w-full h-full object-contain transition-all duration-700",
              isSelected ? "opacity-40 grayscale-50" : "group-hover:scale-105",
            )}
            alt={image.filename}
          />

          {/* Simple hover overlay */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Enlarge Button on right corner */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className={cn(
              "absolute top-4 right-4 bg-primary/40 backdrop-blur-xl text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:scale-110 z-30 border border-white/20 shadow-2xl",
            )}
            title="View Full Size"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Details at the end (Bottom) - Improved styling */}
      {/* <div className="p-5 bg-secondary/5 border-t border-white/5 space-y-2 flex justify-around">
        <div
          className={cn(
            "text-xs font-black truncate tracking-tight transition-colors duration-300",
            isSelected ? "text-red-500/60" : "text-foreground",
          )}
        >
          {image.filename}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-black truncate tracking-tight transition-colors duration-300">
            {image.size}
          </p>
          <p className="text-xs font-black truncate tracking-tight transition-colors duration-300">
            {image.resolution}
          </p>
        </div>
      </div> */}

      <div className="mt-4 px-2 space-y-1 transition-all duration-500 group-hover:translate-x-1">
        <p
          className={cn(
            "text-xs font-black text-foreground truncate tracking-tight",
            isSelected && "text-red-500",
          )}
        >
          {image.filename}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
            {image.size}
          </p>
          <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
          <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
            {image.resolution || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
};

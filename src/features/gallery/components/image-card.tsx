import { ImageDto, TagDto } from "@/services/tauri";
import { getFileURI } from "@/services/tauri/tauri-api";
import { Maximize2, MoreHorizontal, Heart, Tag as TagIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useGalleryStore } from "@/hooks/use-gallery-store";

interface ImageCardProps {
  image: ImageDto;
  index: number;
  onPreview: (image: ImageDto) => void;
  systemTags: TagDto[];
}

export const ImageCard = ({
  image,
  index,
  onPreview,
  systemTags,
}: ImageCardProps) => {
  const { toggleTagOnImage, userTags } = useGalleryStore();

  const favoriteTag = systemTags.find(
    (t) => t.tagName.toLowerCase() === "favorite",
  );

  // NOTE: This is still a bit of a placeholder logic since ImageDto doesn't carry tag info
  // In a real scenario, the store would track which images have which tags.
  const isFavorited = false;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoriteTag) {
      toggleTagOnImage(image.id, favoriteTag.id);
    }
  };

  const handleToggleTag = (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTagOnImage(image.id, tagId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
        delay: Math.min(index * 0.01, 0.1),
      }}
      className="group relative cursor-pointer"
      onClick={() => onPreview(image)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border shadow-sm group-hover:shadow-2xl group-hover:border-primary/50 transition-all duration-500">
        <img
          src={getFileURI(image.thumbnailPath || image.path)}
          alt={image.path.split("/").pop()}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2.5 group-hover:translate-y-0">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-8 w-8 rounded-xl bg-background/80 backdrop-blur-md border hover:bg-red-500 hover:text-white transition-all duration-300",
              isFavorited && "bg-red-500 text-white border-red-500",
            )}
            onClick={handleFavoriteToggle}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-xl bg-background/80 backdrop-blur-md border hover:bg-background transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2 shadow-2xl border-muted/50 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onPreview(image)}
                className="rounded-xl focus:bg-primary focus:text-primary-foreground"
              >
                <Maximize2 className="mr-2 w-4 h-4" /> Open Preview
              </DropdownMenuItem>

              <DropdownMenuSeparator className="opacity-50" />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl">
                  <TagIcon className="mr-2 w-4 h-4" /> Quick Labels
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48 rounded-2xl p-2 shadow-2xl border-muted/50 backdrop-blur-xl">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                    Apply Label
                  </DropdownMenuLabel>
                  {userTags.length === 0 && (
                    <DropdownMenuItem disabled className="text-[10px] italic">
                      No labels created
                    </DropdownMenuItem>
                  )}
                  {userTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      onClick={(e) => handleToggleTag(tag.id, e)}
                      className="rounded-xl flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.tagColor }}
                      />
                      <span className="flex-1">{tag.tagName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2.5 group-hover:translate-y-0">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-white font-black truncate tracking-wide">
              {image.path.split("/").pop()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
                {image.resolution}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">
                {image.size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

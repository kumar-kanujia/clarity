import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getFileURI } from "@/tauri/tauri-api";
import { Image } from "@/types";
import { Layers, Maximize2, ImageOff } from "lucide-react";
import { ImageModal } from "./image-modal";
import { useGetScannerStore } from "../hooks/use-scanner-store";
import { ThresholdSlider } from "./threshold-slider";
import { motion, AnimatePresence } from "motion/react";

interface ScanPreviewProps {
  handleRunScan: () => void;
  images: Image[];
}

/**
 * ScanPreview Component
 * Displays a preview of all images in the selected folder before scanning.
 * Includes a premium threshold slider and larger thumbnails.
 */
export const ScanPreview = ({ handleRunScan, images }: ScanPreviewProps) => {
  const { threshold, setThreshold } = useGetScannerStore();
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
      {/* Top Section: Analysis Settings - Aligned and balanced */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        <div className="flex-1 min-w-0">
          <ThresholdSlider value={threshold} onChange={setThreshold} />
        </div>

        <div className="lg:w-80 flex shrink-0">
          <div className="w-full bg-primary/10 p-6 rounded-4xl border border-primary/20 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="space-y-1">
              <p className="text-4xl font-black text-foreground tracking-tighter">
                {images.length}
              </p>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                Images Found
              </p>
            </div>
            <Button
              onClick={handleRunScan}
              disabled={images.length === 0}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <Layers className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Start Scan
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of All Images - Gallery Feel */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Folder Gallery
            </h2>
          </div>
          <span className="text-[10px] font-black bg-secondary/50 px-4 py-1.5 rounded-full text-muted-foreground uppercase tracking-widest border border-white/5">
            {images.length} Items Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-4xl bg-secondary/5 animate-in fade-in zoom-in duration-700">
              <div className="p-8 bg-secondary/20 rounded-full mb-6">
                <ImageOff className="w-16 h-16 text-muted-foreground/20" />
              </div>
              <p className="text-2xl font-black text-foreground">
                Empty Folder
              </p>
              <p className="text-muted-foreground font-medium mt-2 max-w-xs text-center opacity-60">
                No images detected in this directory. Try selecting a different
                location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 pb-10">
              <AnimatePresence mode="popLayout">
                {images.map((photo, idx) => (
                  <div key={photo.path} className="flex flex-col group">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(idx * 0.02, 0.4),
                        ease: "easeOut",
                      }}
                      className="relative rounded-3xl overflow-hidden border border-white/5 bg-secondary/10 aspect-square shadow-md transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1"
                    >
                      <img
                        src={getFileURI(photo.path)}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                        alt={photo.filename}
                      />

                      {/* Simple overlay gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Enlarge Button - High Quality */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(photo);
                        }}
                        className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:scale-110 z-10 border border-white/20 shadow-2xl"
                        title="View Full Size"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </motion.div>

                    {/* Details below image - Refined Styling */}
                    <div className="mt-4 px-2 space-y-1 transition-all duration-500 group-hover:translate-x-1">
                      <p className="text-xs font-black text-foreground truncate tracking-tight">
                        {photo.filename}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          {photo.size}
                        </p>
                        <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          {photo.resolution || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

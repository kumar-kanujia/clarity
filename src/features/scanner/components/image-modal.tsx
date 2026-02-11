import { getFileURI } from "@/tauri/tauri-api";
import { Image } from "@/types";
import { X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ImageModalProps {
  image: Image | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const ImageModal = ({
  image,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ImageModalProps) => {
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "i") setShowInfo((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!image) return null;

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Info Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
            className={cn(
              "absolute top-4 right-16 z-50 p-2 rounded-full transition-colors",
              showInfo
                ? "bg-white text-black"
                : "bg-white/10 hover:bg-white/20 text-white",
            )}
          >
            <Info className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev?.();
              }}
              className="absolute left-4 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
              className="absolute right-4 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Main Content */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <motion.img
              key={image.filePath}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={getFileURI(image.filePath)}
              alt={image.fileName}
              className="max-h-full max-w-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info Panel */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-2xl border-l border-white/10 p-6 shadow-2xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold text-white mb-6 break-words">
                    {image.fileName}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                        Dimensions
                      </h3>
                      <p className="text-white font-mono">{image.resolution}</p>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                        Size
                      </h3>
                      <p className="text-white font-mono">{image.fileSize}</p>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                        Created
                      </h3>
                      <p className="text-white font-mono">
                        {/* @ts-ignore */}
                        {format(new Date(image.createdAt * 1000), "PPP p")}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                        Path
                      </h3>
                      <p className="text-white/70 text-xs font-mono break-all">
                        {image.filePath}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

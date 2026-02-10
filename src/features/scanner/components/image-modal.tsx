import { getFileURI } from "@/tauri/tauri-api";
import { Image } from "@/types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-full max-h-full flex flex-col items-center justify-center w-full h-full"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-white/10 text-white/70 hover:text-white p-2 rounded-full transition-all border border-white/5 backdrop-blur-sm cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev?.();
                }}
                className="absolute left-4 z-50 bg-black/50 hover:bg-white/10 text-white/70 hover:text-white p-3 rounded-full transition-all border border-white/5 backdrop-blur-sm cursor-pointer hover:scale-110"
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
                className="absolute right-4 z-50 bg-black/50 hover:bg-white/10 text-white/70 hover:text-white p-3 rounded-full transition-all border border-white/5 backdrop-blur-sm cursor-pointer hover:scale-110"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <motion.img
              key={image.path}
              //   initial={{ x: 20, opacity: 0 }}
              //   animate={{ x: 0, opacity: 1 }}
              //   transition={{ duration: 0.2 }}
              src={getFileURI(image.path)}
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              alt={image.filename}
            />

            {/* Bottom Details Bar - Only visible on hover or if explicitly desired */}
            <div
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full text-white transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <p className="font-semibold text-sm">{image.filename}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{image.resolution}</span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span>{image.size}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

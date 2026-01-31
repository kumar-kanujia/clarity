import { getFileURI } from "@/tauri/tauri-api";
import { Image } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  image: Image | null;
  onClose: () => void;
}

export const ImageModal = ({ image, onClose }: ImageModalProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-white/10 text-white/70 hover:text-white p-2 rounded-full transition-all border border-white/5 backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>

        <img
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
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { getFileURI } from "@/lib/tauri-api";
import { Image } from "@/types";
import { Layers, Settings } from "lucide-react";

interface ScanPreviewProps {
  threshold: number;
  setThreshold: (threshold: number) => void;
  handleRunScan: () => void;
  images: Image[];
}

export const ScanPreview = ({
  threshold,
  setThreshold,
  handleRunScan,
  images,
}: ScanPreviewProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 mb-6 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-64">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Settings className="w-3 h-3" /> Similarity Threshold
              </span>
              <span className="text-white font-mono">{threshold}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 px-0.5">
              <span>Strict (Identical)</span>
              <span>Loose</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRunScan}
          className="w-full md:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border-0"
        >
          <Layers className="w-4 h-4 mr-2" />
          Start Processing
        </Button>
      </div>

      {/* Grid of All Images */}
      <h2 className="text-sm font-medium text-zinc-500 mb-4 px-1">
        Folder Contents ({images.length})
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {images.map((photo) => (
            <div
              key={photo.filename}
              className="relative group rounded-lg overflow-hidden border border-white/5 bg-zinc-900 aspect-square"
            >
              <img
                src={getFileURI(photo.path)}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-[10px] text-white truncate w-full">
                  {photo.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

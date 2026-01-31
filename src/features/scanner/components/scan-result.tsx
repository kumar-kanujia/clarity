import { Button } from "@/components/ui/button";
import { getFileURI } from "@/lib/tauri-api";
import { AppState, Image } from "@/types";
import { AlertCircle, CheckCircle2, Layers } from "lucide-react";

interface ScanResultProps {
  groups: Image[][];
  setAppState: (state: AppState) => void;
}

export const ScanResult = ({ groups, setAppState }: ScanResultProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-600/20 p-2 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Scan Complete</h2>
            <p className="text-sm text-zinc-400">
              Found {groups.length} groups of similar images.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setAppState("PREVIEW")}>
          Back to Preview
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-10">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
            <AlertCircle className="w-10 h-10 text-zinc-600 mb-3" />
            <p className="text-zinc-400">
              No similar images found with current threshold.
            </p>
          </div>
        ) : (
          groups.map((group, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 transition-all hover:border-zinc-700"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="font-medium text-zinc-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" /> Group #
                  {idx + 1}
                </h3>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                  {group.length} images
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.map((img, idx) => {
                  const isBest = idx === 0;
                  return (
                    <div
                      key={img.path}
                      className={`relative group rounded-lg overflow-hidden border ${isBest ? "border-green-500/50 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]" : "border-white/5 bg-black/20"}`}
                    >
                      {isBest && (
                        <div className="absolute top-2 right-2 z-10 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                          BEST
                        </div>
                      )}
                      <img
                        src={getFileURI(img.path)}
                        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <p className="text-xs font-medium text-white truncate">
                          {img.filename}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {img.size} • {img.resolution}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

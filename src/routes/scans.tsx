import { ImageDto } from "@/services/tauri";
import { getFileURI } from "@/services/tauri/tauri-api";
import { ImageModal } from "@/components/elements/image-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryStore } from "@/hooks/use-gallery-store";
import { createFileRoute } from "@tanstack/react-router";
import { Layers, Maximize2, Scan, CheckCircle2 } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/scans")({
  component: ScansPage,
});

function ScansPage() {
  const { groupedImages, isScansLoading, hasMoreGroups, loadGroupedImages } =
    useGalleryStore();

  const [previewImage, setPreviewImage] = useState<ImageDto | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async () => {
    setHasScanned(true);
    await loadGroupedImages(true);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Page Header Toolbar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            Identity Scans
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
            Discover exact duplicates in your collection
          </p>
        </div>

        <Button
          onClick={handleScan}
          disabled={isScansLoading}
          className="rounded-full bg-primary h-9 px-6 hover:scale-105 transition-transform font-bold text-xs uppercase tracking-widest"
        >
          {isScansLoading ? "Scanning..." : "Start Scan"}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        {!hasScanned ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
            <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <Scan className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Ready to scan</h2>
            <p className="text-zinc-500 max-w-sm text-sm mb-8">
              Click the button above to analyze your library for duplicate
              images. This may take a moment.
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="grid gap-12">
              {groupedImages.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                        Group {groupIdx + 1}
                      </h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        {group.length} Duplicate matches
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    <AnimatePresence mode="popLayout">
                      {group.map((image, idx) => (
                        <motion.div
                          key={image.path + idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: idx * 0.02 }}
                          className="group relative"
                        >
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                            <img
                              src={getFileURI(
                                image.thumbnailPath || image.path,
                              )}
                              alt={image.path.split("/").pop()}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-transparent group-hover:bg-zinc-950/40 transition-colors duration-300" />

                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => setPreviewImage(image)}
                                className="p-2.5 rounded-xl bg-zinc-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-black transition-colors"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                              <p className="text-[10px] text-white/50 font-mono truncate">
                                {image.path.split("/").pop()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              {isScansLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-square rounded-2xl bg-zinc-900"
                    />
                  ))}
                </div>
              )}

              {!isScansLoading && hasMoreGroups && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => loadGroupedImages()}
                    className="rounded-full px-10 h-10 bg-zinc-900 border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800"
                  >
                    Load more groups
                  </Button>
                </div>
              )}

              {hasScanned && !isScansLoading && groupedImages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-white">
                    No duplicates found
                  </h2>
                  <p className="text-zinc-500 max-w-sm text-sm">
                    Your library is perfectly clean. No identical images were
                    discovered.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}

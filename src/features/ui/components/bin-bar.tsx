import { motion } from "motion/react";
import { Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";

export function BinBar() {
  const { systemTags, currentTagId } = useTagStore();
  const trashTag = systemTags.find((t) => t.tagName.toLowerCase() === "trash");
  const isTrashView = currentTagId === trashTag?.id;

  if (!isTrashView) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="bg-zinc-950/80 backdrop-blur-2xl border border-red-500/20 rounded-[32px] p-2 flex items-center gap-2 shadow-2xl shadow-red-500/10 pointer-events-auto">
        <div className="px-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Bin Sanctuary
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-tight">
              Items are preserved here
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/5 mx-2" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-2xl h-10 px-5 text-zinc-400 hover:text-white hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore All
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-2xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-red-500/20"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Purge Empty
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

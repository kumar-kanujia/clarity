import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

export const InitView = ({
  handleOpenFolder,
}: {
  handleOpenFolder: () => void;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="relative group cursor-pointer" onClick={handleOpenFolder}>
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
        <div className="relative bg-zinc-900 border border-zinc-800 p-12 rounded-3xl flex flex-col items-center gap-6 shadow-2xl group-hover:border-zinc-700 transition-colors">
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
            <FolderOpen className="w-16 h-16 text-blue-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-white">
              Select a Folder
            </h3>
            <p className="text-zinc-400 max-w-xs">
              Choose a directory containing images to start scanning for
              duplicates.
            </p>
          </div>
          <Button size="lg" className="w-full font-medium">
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  );
};

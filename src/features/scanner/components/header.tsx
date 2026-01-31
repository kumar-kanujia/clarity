import { FolderOpen, ImageIcon } from "lucide-react";
import { AppState } from "@/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  appState: AppState;
  currentPath: string;
  handleOpenFolder: () => Promise<void>;
  handleReset: () => void;
}

export const Header = ({
  appState,
  handleOpenFolder,
  currentPath,
  handleReset,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b/20 border-white/10 pb-4 mb-6">
      <Button
        className="flex items-center gap-3"
        variant="link"
        onClick={handleReset}
      >
        <div className="bg-blue-600/20 p-2 rounded-lg">
          <ImageIcon className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Clarity
        </h1>
      </Button>

      {appState !== "INIT" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-md text-xs text-muted-foreground border border-white/5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="truncate max-w-50">{currentPath}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenFolder}
            className="text-xs hover:bg-white/5"
          >
            Change Folder
          </Button>
        </div>
      )}
    </div>
  );
};

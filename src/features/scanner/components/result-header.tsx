import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2 } from "lucide-react";

interface ResultHeaderProps {
  groupsCount: number;
  selectedCount: number;
  isDeleting: boolean;
  onDelete: () => void;
  onBack: () => void;
}

/**
 * ResultHeader Component
 * Displays the scan status, number of duplicate groups found,
 * and the delete action when images are selected.
 */
export const ResultHeader = ({
  groupsCount,
  selectedCount,
  isDeleting,
  onDelete,
  onBack,
}: ResultHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-6 border-b border-white/5">
      <div className="flex items-center gap-4">
        <div className="bg-green-500/10 p-2.5 rounded-full border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Scan Complete</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Found {groupsCount} groups of potential duplicates.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {selectedCount > 0 && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-muted-foreground text-sm font-medium">
              {selectedCount} selected
            </span>
            <Button
              onClick={onDelete}
              disabled={isDeleting || selectedCount === 0}
              variant="destructive"
              className="rounded-xl h-12 px-6 font-black text-sm shadow-xl shadow-red-500/20 group text-white"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete selected
                </span>
              )}
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 px-5 rounded-xl border-white/10 hover:bg-white/5 font-semibold"
        >
          Adjust Settings
        </Button>
      </div>
    </div>
  );
};

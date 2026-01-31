import { Button } from "@/components/ui/button";
import { ChevronRight, FolderOpen, ScanText } from "lucide-react";
import { AppState } from "@/types";
import { cn } from "@/lib/utils";
import { CustomThemeToggle } from "@/components/elements/theme-toggle";

interface ScannerHeaderProps {
  appState: AppState;
  currentPath: string;
  handleOpenFolder: () => void;
  handleReset: () => void;
}

/**
 * ScannerHeader Component
 * Displays the application title, the current folder path (breadcrumb-style),
 * and the theme toggle. Optimized for responsiveness.
 */
export const ScannerHeader = ({
  appState,
  handleOpenFolder,
  currentPath,
  handleReset,
}: ScannerHeaderProps) => {
  // Split path into parts for a breadcrumb-like display
  const pathParts = currentPath
    ? currentPath.split(/[/\\]/).filter(Boolean)
    : [];
  // Take last 3 parts to avoid overflowing
  const displayParts =
    pathParts.length > 3 ? ["...", ...pathParts.slice(-3)] : pathParts;

  return (
    <div className="flex md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-10 overflow-hidden">
      <div className="flex flex-wrap items-center w-full gap-6 md:gap-10">
        {/* Logo / Title */}
        <Button
          className="flex items-center gap-4 hover:no-underline p-0 h-auto group transition-all duration-300 transform active:scale-95 outline-none"
          variant="link"
          onClick={handleReset}
        >
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <ScanText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tightest">
            CLARITY<span className="text-primary">.</span>
          </span>
        </Button>

        {/* Path Display (Breadcrumbs) - Always visible, stacks on small screens */}
        {appState !== "INIT" && currentPath && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-2xl border border-white/5 animate-in slide-in-from-left-4 duration-500 max-w-full">
            <FolderOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <div className="flex items-center gap-1.5 overflow-hidden">
              {displayParts.map((part, idx) => (
                <div key={idx} className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors truncate",
                      idx === displayParts.length - 1
                        ? "text-foreground"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {part}
                  </span>
                  {idx < displayParts.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/20 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFolder}
              className="ml-2 h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all shrink-0"
            >
              Change
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4">
        <CustomThemeToggle />

        {appState === "INIT" && (
          <Button
            onClick={handleOpenFolder}
            className="rounded-2xl bg-foreground text-background font-black h-11 px-6 hover:scale-105 transition-all shadow-xl"
          >
            Open Folder
          </Button>
        )}
      </div>
    </div>
  );
};

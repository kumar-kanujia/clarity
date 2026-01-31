import { Button } from "@/components/ui/button";
import { FolderOpen, Sparkles } from "lucide-react";
import { motion } from "motion/react";

/**
 * InitView Component
 * The initial landing state of the application.
 * Features a high-quality entrance animation and a clear call to action.
 */
export const InitView = ({
  handleOpenFolder,
}: {
  handleOpenFolder: () => void;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-2xl w-full"
      >
        {/* Decorative Background Glow */}
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-[4rem] -z-10 animate-pulse" />

        <div
          className="relative bg-secondary/20 border border-white/5 p-12 rounded-[3.5rem] flex flex-col items-center gap-10 shadow-2xl backdrop-blur-xl group hover:border-primary/30 transition-all duration-500 cursor-pointer"
          onClick={handleOpenFolder}
        >
          {/* Central Icon */}
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-8 bg-background/50 rounded-3xl border border-white/10 shadow-inner group-hover:shadow-primary/20 group-hover:scale-110 transition-all duration-500"
            >
              <FolderOpen className="w-20 h-20 text-primary" />
            </motion.div>

            {/* Sparkle decorative icons */}
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 text-primary"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tight">
              Start Your <span className="text-primary">Clarity</span> Journey
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm mx-auto opacity-80">
              Select a folder to instantly identify and clean up duplicate
              images with AI-powered similarity detection.
            </p>
          </div>

          {/* Call to action button */}
          <Button
            size="lg"
            className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 transition-all group-hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <FolderOpen className="w-6 h-6" />
            Pick a Folder
          </Button>

          {/* Subtle footer hint */}
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            Fast • Secure • Local
          </p>
        </div>
      </motion.div>
    </div>
  );
};

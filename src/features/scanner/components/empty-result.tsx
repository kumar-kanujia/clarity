import { CheckCircle2 } from "lucide-react";

/**
 * EmptyResult Component
 * Displayed when no similar images are found or all have been resolved.
 */
export const EmptyResult = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-secondary/10 animate-in fade-in zoom-in duration-700">
      <div className="p-6 bg-green-500/10 rounded-full mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
      </div>
      <h3 className="text-2xl font-black text-foreground mb-3">
        Your library is clean!
      </h3>
      <p className="text-muted-foreground max-w-sm text-center leading-relaxed font-medium">
        No similar images found in this folder. You're all set!
      </p>
    </div>
  );
};

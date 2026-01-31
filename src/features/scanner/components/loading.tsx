import { Loader2 } from "lucide-react";

export const LoadingFile = ({ loadingText }: { loadingText: string }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin relative z-10" />
      </div>
      <p className="text-lg font-medium text-zinc-300">{loadingText}</p>
    </div>
  );
};

import { createFileRoute } from "@tanstack/react-router";
import { Clock, History, Calendar } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/recent" as any)({
  component: RecentPage,
});

function RecentPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <header className="h-14 flex items-center px-8 bg-zinc-950/20 backdrop-blur-md">
        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">
          Timeline Analysis
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl">
            <Clock className="w-10 h-10 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
            Chronological Void
          </h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
            This module is currently being calibrated. Future updates will
            reveal your most recently synchronized assets here.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 items-start opacity-40">
              <History className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                History Log
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 items-start opacity-40">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Date Filter
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

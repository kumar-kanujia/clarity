import { createFileRoute } from "@tanstack/react-router";
import { Sliders, Shield, Database, Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <header className="h-14 flex items-center px-8 bg-zinc-950/20 backdrop-blur-md">
        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">
          System Preferences
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-12">
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-3">
              <Sliders className="w-4 h-4" /> Interface
            </h2>
            <div className="grid gap-4">
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Space Theme</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Deep space dark mode with glassmorphism
                  </p>
                </div>
                <div className="h-6 w-10 rounded-full bg-primary relative">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-3">
              <Shield className="w-4 h-4" /> Privacy & Security
            </h2>
            <div className="grid gap-4">
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors cursor-pointer">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Local Storage Only
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Your data never leaves your device
                  </p>
                </div>
                <Database className="w-5 h-5 text-zinc-600" />
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                Clarity v0.1.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-zinc-500 hover:text-white"
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-zinc-500 hover:text-white"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

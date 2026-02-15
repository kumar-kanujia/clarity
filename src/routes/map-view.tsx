import { createFileRoute } from "@tanstack/react-router";
import {
  Map as MapIcon,
  Navigation,
  LocateFixed,
  Layers,
  Pin,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/map-view" as any)({
  component: MapViewPage,
});

function MapViewPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden relative">
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <MapIcon className="w-5 h-5 text-zinc-400" />
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Cartography
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full h-9 px-4 text-xs font-bold uppercase tracking-widest gap-2 bg-white/5"
          >
            <Layers className="w-3.5 h-3.5" />
            Satellite
          </Button>
          <Button
            size="sm"
            className="rounded-full h-9 px-4 text-xs font-bold uppercase tracking-widest gap-2 bg-primary text-white"
          >
            <Navigation className="w-3.5 h-3.5" />
            Focus
          </Button>
        </div>
      </header>

      <div className="flex-1 relative bg-zinc-900 overflow-hidden cursor-crosshair">
        {/* Fake Map Grid */}
        <div
          className="absolute inset-0 grayscale opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff10 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Fake Map Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative"
          >
            {/* Simulated Path */}
            <svg className="absolute top-0 left-0 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 opacity-20">
              <motion.path
                d="M 100 100 Q 250 50 400 100 T 500 400"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="5 5"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Pins */}
            {[
              { x: 100, y: -50, color: "blue", label: "Iceland Expedition" },
              { x: -150, y: 120, color: "emerald", label: "Tropical Base" },
              { x: 50, y: 200, color: "amber", label: "Urban Sprawl" },
            ].map((pin, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                style={{ left: pin.x, top: pin.y }}
                className="absolute group"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-${pin.color}-500/20 border border-${pin.color}-500/50 flex items-center justify-center animate-pulse`}
                >
                  <Pin
                    className={`w-3 h-3 text-${pin.color}-400 fill-current`}
                  />
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-white/5 backdrop-blur-xl px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                  <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-white">
                    {pin.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <Button
            size="icon"
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 hover:bg-white hover:text-black shadow-2xl"
          >
            <LocateFixed className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

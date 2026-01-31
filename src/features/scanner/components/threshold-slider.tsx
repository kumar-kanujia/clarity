import { motion } from "motion/react";

interface ThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * ThresholdSlider Component
 * A highly styled, custom slider for adjusting the scanning sensitivity.
 * Features a premium look with gradients and smooth animations.
 */
export const ThresholdSlider = ({ value, onChange }: ThresholdSliderProps) => {
  const getThresholdLabel = (val: number) => {
    if (val <= 3)
      return { label: "Strict", description: "Only exact duplicates" };
    if (val <= 10)
      return {
        label: "Balanced",
        description: "Finds similar visual patterns",
      };
    return { label: "Permissive", description: "Broad similarity detection" };
  };

  const { description } = getThresholdLabel(value);

  return (
    <div className="space-y-6 p-6 bg-secondary/20 border border-white/5 rounded-4xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground tracking-tight">
            Similarity Threshold
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            {description}
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl font-black text-primary animate-in fade-in zoom-in duration-300"
            key={value}
          >
            {value}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            px
          </span>
        </div>
      </div>

      <div className="relative h-10 flex items-center group">
        {/* Track Background */}
        <div className="absolute inset-0 h-1.5 my-auto bg-white/10 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <motion.div
            className="h-full bg-linear-to-r from-primary/40 to-primary"
            animate={{ width: `${(value / 30) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* The Actual Input */}
        <input
          type="range"
          min="1"
          max="30"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom Thumb */}
        <motion.div
          className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)] border-2 border-primary z-0 pointer-events-none"
          animate={{ left: `calc(${(value / 30) * 100}% - 10px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Labels underneath */}
        <div className="absolute -bottom-5 w-full flex justify-between px-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-30">
            Exact
          </span>
          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-30">
            Similar
          </span>
        </div>
      </div>

      <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
        <p className="text-[11px] text-primary/80 leading-snug font-medium">
          <span className="font-black uppercase tracking-tighter mr-2">
            Tip:
          </span>
          Low for identical, high for similar pattern detection.
        </p>
      </div>
    </div>
  );
};

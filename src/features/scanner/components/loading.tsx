import { motion } from "motion/react";

/**
 * LoadingFile Component
 * Displays a 'running car' animation during long-running processes like scanning.
 * Utilizes Framer Motion for smooth animations.
 */
export const LoadingFile = ({ loadingText }: { loadingText: string }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative w-64 h-32 flex items-center justify-center">
        {/* Track/Road */}
        <div className="absolute bottom-0 w-full h-1 bg-white/10 rounded-full" />

        {/* Running Car Animation */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{
            x: [100, 0, 0, -100],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.8, 1],
          }}
          className="relative text-5xl"
        >
          🏃🏼‍♂️‍➡️
          {/* Exhaust Flashes */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute -left-4 top-4 w-3 h-3 bg-orange-500/40 blur-sm rounded-full"
          />
        </motion.div>

        {/* Speed Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: -100, opacity: [0, 0.5, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
              className="absolute h-0.5 bg-white/20 rounded-full"
              style={{
                top: `${40 + i * 15}%`,
                width: `${20 + i * 10}px`,
                right: "-20px",
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-2xl font-black text-foreground tracking-tight animate-pulse">
          {loadingText}
        </p>
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
          Please wait while we analyze your files
        </p>
      </div>
    </div>
  );
};

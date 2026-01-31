import { motion } from "motion/react";
import { useTheme } from "@/components/providers/theme-provider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Custom ThemeToggle Component
 * Features a smooth, high-quality animation when switching between light and dark modes.
 */
export const CustomThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-20 h-10 bg-secondary/30 rounded-full p-1 border border-white/5 transition-colors overflow-hidden group hover:border-primary/50 hidden md:block"
      aria-label="Toggle Theme"
    >
      {/* Background slide effect */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/30"
        initial={false}
        animate={{ x: isDark ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      <div className="relative flex items-center justify-between h-full px-1.5 w-full">
        {/* Sun Icon */}
        <div className="z-10 w-6 h-6 flex items-center justify-center">
          <Sun
            className={`w-4 h-4 transition-all duration-500 ${!isDark ? "text-primary scale-110" : "text-muted-foreground/40 scale-75"}`}
          />
        </div>

        {/* Moon Icon */}
        <div className="z-10 w-6 h-6 flex items-center justify-center">
          <Moon
            className={`w-4 h-4 transition-all duration-500 ${isDark ? "text-primary scale-110" : "text-muted-foreground/40 scale-75"}`}
          />
        </div>

        {/* The Switch Handle */}
        <motion.div
          className="absolute size-8 bg-white rounded-full shadow-lg z-0 flex items-center justify-center"
          initial={false}
          animate={{
            x: isDark ? 30 : -4,
            backgroundColor: isDark ? "#ffffff" : "#000000",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Subtle glow based on theme */}
          <div
            className={`absolute inset-0 rounded-full blur-md opacity-20 ${isDark ? "bg-white" : "bg-black"}`}
          />
        </motion.div>
      </div>
    </button>
  );
};

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "pink";
}

const glowColors = {
  cyan: {
    border: "border-cyan-500/30",
    shadow: "shadow-cyan-500/10",
    gradient: "from-cyan-500/5 via-transparent to-transparent",
  },
  purple: {
    border: "border-purple-500/30",
    shadow: "shadow-purple-500/10",
    gradient: "from-purple-500/5 via-transparent to-transparent",
  },
  pink: {
    border: "border-pink-500/30",
    shadow: "shadow-pink-500/10",
    gradient: "from-pink-500/5 via-transparent to-transparent",
  },
};

export function HolographicCard({
  children,
  className = "",
  glowColor = "cyan",
}: HolographicCardProps) {
  const colors = glowColors[glowColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      {/* Main card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-xl
                    border ${colors.border} shadow-2xl ${colors.shadow}`}
      >
        {/* Top gradient */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.gradient}`} />

        {/* Holographic scan line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none"
          style={{ height: "2px" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent`} />
          <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-cyan-500 to-transparent`} />
        </div>
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className={`absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-500 to-transparent`} />
          <div className={`absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-cyan-500 to-transparent`} />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16">
          <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent`} />
          <div className={`absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-cyan-500 to-transparent`} />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-500 to-transparent`} />
          <div className={`absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-cyan-500 to-transparent`} />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  green: "text-emerald-400",
  amber: "text-amber-400",
  pink: "text-pink-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
};

interface WinnerBannerProps {
  winnerName: string;
  winnerColor: string;
}

export function WinnerBanner({ winnerName, winnerColor }: WinnerBannerProps) {
  const textClass = COLOR_TEXT[winnerColor] ?? "text-cyan-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className="text-center py-8"
    >
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-2"
      >
        Winner!
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`text-4xl sm:text-5xl font-extrabold ${textClass} drop-shadow-lg`}
      >
        {winnerName}
      </motion.h1>
    </motion.div>
  );
}

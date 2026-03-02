"use client";

import { motion } from "framer-motion";

interface CurrentPlayerLabelProps {
  playerName: string;
  /** When true, uses full-width button-sized layout with bold white text (e.g. bottom of Cricket) */
  prominent?: boolean;
  className?: string;
}

export function CurrentPlayerLabel({
  playerName,
  prominent = false,
  className = "",
}: CurrentPlayerLabelProps) {
  return (
    <motion.div
      key={playerName}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0.6, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        cursor-default select-none
        ${prominent
          ? "w-full min-h-[48px] py-3 px-4 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-600 text-white font-bold text-lg"
          : "inline-flex items-center min-h-[38px] px-4 rounded-lg bg-zinc-800/80 border border-zinc-600 text-zinc-400 font-medium text-sm"}
        ${className}
      `}
    >
      Current Player: {playerName}
    </motion.div>
  );
}

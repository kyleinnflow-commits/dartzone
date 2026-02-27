"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types";

interface TurnIndicatorProps {
  round: number;
  currentPlayer: Player;
}

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  green: "text-emerald-400",
  amber: "text-amber-400",
  pink: "text-pink-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
};

export function TurnIndicator({ round, currentPlayer }: TurnIndicatorProps) {
  const textClass = COLOR_TEXT[currentPlayer.color] ?? "text-cyan-400";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <span className="text-zinc-400 font-medium">Round {round}</span>
      <motion.span
        key={currentPlayer.name}
        initial={{ opacity: 0.7, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className={`font-bold text-lg sm:text-xl ${textClass} flex items-center gap-2`}
      >
        <span
          className="w-2 h-2 rounded-full bg-current animate-pulse"
          aria-hidden
        />
        {currentPlayer.name}&apos;s turn
      </motion.span>
    </div>
  );
}

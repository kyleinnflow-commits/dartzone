"use client";

import { motion } from "framer-motion";
import { QUICK_SCORES } from "@/lib/constants";

const PROMINENT = new Set([60, 100, 140, 180]);

interface QuickScoresProps {
  onScore: (score: number) => void;
  maxScore: number;
}

export function QuickScores({ onScore, maxScore }: QuickScoresProps) {
  const scores = QUICK_SCORES.filter((s) => s <= maxScore);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {scores.map((score) => {
        const isProminent = PROMINENT.has(score);
        return (
          <motion.button
            key={score}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onScore(score)}
            className={`
              min-h-[48px] rounded-xl font-bold text-lg
              bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-500/20
              border border-zinc-700 text-white
              transition-colors
              ${isProminent ? "col-span-1 text-xl sm:min-h-[52px] ring-1 ring-cyan-500/30" : ""}
            `}
          >
            {score}
          </motion.button>
        );
      })}
    </div>
  );
}

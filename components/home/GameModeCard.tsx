"use client";

import { motion } from "framer-motion";
import type { GameMode } from "@/types";

interface GameModeCardProps {
  mode: GameMode;
  title: string;
  description: string;
  accentClass: string;
  borderAccentClass: string;
  onSelect: () => void;
  index: number;
}

export function GameModeCard({
  mode,
  title,
  description,
  accentClass,
  borderAccentClass,
  onSelect,
  index,
}: GameModeCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={`
        w-full text-left rounded-xl p-5 sm:p-6
        bg-zinc-900 border-2 border-zinc-800
        hover:border-zinc-700 hover:shadow-xl
        min-h-[120px] flex flex-col justify-center
        transition-colors duration-200
        ${borderAccentClass}
      `}
      onClick={onSelect}
    >
      <span className={`text-xl sm:text-2xl font-bold ${accentClass}`}>
        {title}
      </span>
      <p className="text-sm sm:text-base text-zinc-400 mt-1">{description}</p>
    </motion.button>
  );
}

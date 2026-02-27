"use client";

import { motion } from "framer-motion";

interface PlayerInputProps {
  index: number;
  value: string;
  colorIndex: number;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}

const COLOR_CLASSES = [
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-violet-500",
  "bg-orange-500",
];

export function PlayerInput({
  index,
  value,
  colorIndex,
  canRemove,
  onChange,
  onRemove,
  autoFocus,
}: PlayerInputProps) {
  const colorClass = COLOR_CLASSES[colorIndex % COLOR_CLASSES.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3"
    >
      <div
        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${colorClass}`}
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Player ${index + 1}`}
        autoFocus={autoFocus}
        className="flex-1 min-h-[44px] py-3 px-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-lg"
        maxLength={20}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-red-500/20 text-red-400 border border-zinc-700 hover:border-red-500/50 transition-colors"
          aria-label="Remove player"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

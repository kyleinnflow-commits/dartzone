"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  green: "text-emerald-400",
  amber: "text-amber-400",
  pink: "text-pink-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
};

export function ScoreboardClock() {
  const { state } = useGame();
  const currentIndex = state.currentPlayerIndex;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {state.players.map((player, idx) => {
          const target = state.clockState[player.name] ?? 1;
          const isActive = idx === currentIndex;
          const textClass = COLOR_TEXT[player.color] ?? "text-cyan-400";
          const label = target === 21 ? "Bull" : target;

          return (
            <motion.div
              key={player.name}
              layout
              className={`
                rounded-xl p-4 border-2
                ${isActive ? "border-cyan-500 bg-zinc-900 shadow-lg" : "border-zinc-800 bg-zinc-900/70 opacity-85"}
              `}
            >
              <div className={`font-bold text-xl sm:text-2xl ${isActive ? textClass : "text-zinc-400"}`}>
                {player.name}
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                Aiming for: {label}
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {Array.from({ length: 21 }, (_, i) => i + 1).map((n) => {
                  const completed = target > n;
                  return (
                    <motion.span
                      key={n}
                      initial={false}
                      animate={{ scale: completed ? 1 : 0.9, opacity: completed ? 1 : 0.4 }}
                      className={`
                        w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full
                        ${completed ? "bg-cyan-500" : "bg-zinc-600"}
                      `}
                      aria-hidden
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

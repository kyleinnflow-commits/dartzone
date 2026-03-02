"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { UndoButton } from "@/components/game/UndoButton";

export function ClockInput() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  const currentTarget = state.clockState[currentPlayer.name] ?? 1;
  const label = currentTarget === 21 ? "Bull" : currentTarget;

  const options: number[] = [];
  for (let n = currentTarget; n <= 21; n++) {
    options.push(n);
  }

  const handleSelect = (highestReached: number) => {
    dispatch({ type: "CLOCK_ADVANCE_TO", highestReached });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 min-h-[38px]">
        <p className="text-zinc-400 text-sm">
          <span className="font-semibold text-white">{currentPlayer.name}</span> — 3 darts. Highest number reached?
        </p>
        <UndoButton />
      </div>
      <p className="text-center text-sm text-zinc-500">
        Currently on: <span className="font-bold text-cyan-400">{currentTarget === 21 ? "Bull" : currentTarget}</span>
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {options.map((n) => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(n)}
            className={`
              min-h-[48px] rounded-xl font-bold text-sm sm:text-base
              ${n === 21 ? "bg-amber-500/20 border-2 border-amber-500/50 text-amber-300" : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"}
            `}
          >
            {n === 21 ? "Bull" : n}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

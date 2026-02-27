"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

export function ClockInput() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  const target = state.clockState[currentPlayer.name] ?? 1;
  const label = target === 21 ? "Bull" : target;

  return (
    <div className="space-y-4">
      <p className="text-center text-zinc-400">
        <span className="font-semibold text-white">{currentPlayer.name}</span> aiming for{" "}
        <span className="font-bold text-cyan-400">{label}</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: "HIT_CLOCK" })}
          className="min-h-[56px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg"
        >
          Hit ✓
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: "MISS_CLOCK" })}
          className="min-h-[56px] rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-lg"
        >
          Miss ✗
        </motion.button>
      </div>
    </div>
  );
}

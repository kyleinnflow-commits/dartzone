"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { WinnerBanner } from "@/components/summary/WinnerBanner";
import { StatTable } from "@/components/summary/StatTable";
import { computeStats } from "@/lib/gameStats";

export default function SummaryPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.gameStatus !== "finished" || !state.winner) {
      router.replace("/");
    }
  }, [state.gameStatus, state.winner, router]);

  const winner = state.players.find((p) => p.name === state.winner);
  const stats = useMemo(() => computeStats(state), [state]);

  const handleRematch = () => {
    dispatch({ type: "REMATCH" });
    router.replace("/game");
  };

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME" });
    router.push("/");
  };

  if (state.gameStatus !== "finished" || !state.winner || !winner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-4 sm:p-6">
      <WinnerBanner winnerName={winner.name} winnerColor={winner.color} />
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 mt-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
        <StatTable
          mode={state.mode}
          stats={stats}
          winnerName={winner.name}
        />
      </motion.section>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          onClick={handleRematch}
          className="flex-1 min-h-[52px] py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg"
        >
          Rematch
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleNewGame}
          className="flex-1 min-h-[52px] py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-lg"
        >
          New Game
        </motion.button>
      </div>
    </div>
  );
}

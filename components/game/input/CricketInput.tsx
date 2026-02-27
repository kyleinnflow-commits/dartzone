"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { CRICKET_NUMBERS } from "@/lib/constants";

export function CricketInput() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  const cricketState = state.cricketState[currentPlayer.name];
  const marks = cricketState?.marks ?? {};

  const rowClosed = useMemo(() => {
    const closed: Record<number, boolean> = {};
    for (const num of CRICKET_NUMBERS) {
      closed[num] = state.players.every(
        (p) => (state.cricketState[p.name]?.marks[num] ?? 0) >= 3
      );
    }
    return closed;
  }, [state.cricketState, state.players]);

  const turnTally = useMemo(() => {
    const list: { num: number; count: number }[] = [];
    const round = state.round;
    const name = currentPlayer.name;
    for (let i = state.turnHistory.length - 1; i >= 0; i--) {
      const e = state.turnHistory[i];
      if (e.endTurn) break;
      if (e.playerName !== name || e.round !== round) break;
      if (e.cricketMarks?.length) {
        for (const { number: n, count } of e.cricketMarks) {
          const existing = list.find((x) => x.num === n);
          if (existing) existing.count += count;
          else list.push({ num: n, count });
        }
      }
    }
    return list.filter((x) => x.count > 0).reverse();
  }, [state.turnHistory, currentPlayer.name, state.round]);

  const handleMark = (num: number) => {
    if (rowClosed[num]) return;
    dispatch({ type: "MARK_CRICKET", number: num, count: 1 });
  };

  const handleDone = () => {
    dispatch({ type: "END_TURN" });
  };

  return (
    <div className="space-y-3">
      {turnTally.length > 0 && (
        <div className="text-sm text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
          This turn:{" "}
          {turnTally.map(({ num, count }) => (
            <span key={num} className="font-medium text-zinc-300">
              {num === 25 ? "Bull" : num} ×{count}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {CRICKET_NUMBERS.map((num) => {
          const closed = rowClosed[num];
          const count = marks[num] ?? 0;
          return (
            <motion.button
              key={num}
              type="button"
              whileTap={closed ? undefined : { scale: 0.95 }}
              onClick={() => handleMark(num)}
              disabled={closed}
              className={`
                min-h-[48px] rounded-xl font-bold text-lg
                flex flex-col items-center justify-center gap-0.5
                transition-colors
                ${
                  closed
                    ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
                }
              `}
            >
              <span>{num === 25 ? "Bull" : num}</span>
              {count > 0 && (
                <span className="text-xs font-medium text-zinc-400">
                  {count}/3
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleDone}
        className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg"
      >
        Done
      </motion.button>
    </div>
  );
}

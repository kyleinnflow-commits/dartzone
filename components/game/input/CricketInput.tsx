"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { CRICKET_NUMBERS } from "@/lib/constants";
import { UndoButton } from "@/components/game/UndoButton";
import { CurrentPlayerLabel } from "@/components/game/CurrentPlayerLabel";

const COLOR_BG: Record<string, string> = {
  cyan: "from-cyan-500/25 to-transparent",
  green: "from-emerald-500/25 to-transparent",
  amber: "from-amber-500/25 to-transparent",
  pink: "from-pink-500/25 to-transparent",
  violet: "from-violet-500/25 to-transparent",
  orange: "from-orange-500/25 to-transparent",
};

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-300",
  green: "text-emerald-300",
  amber: "text-amber-300",
  pink: "text-pink-300",
  violet: "text-violet-300",
  orange: "text-orange-300",
};

export function CricketInput() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  const prevIndexRef = useRef<number | null>(null);
  const [overlay, setOverlay] = useState<{ name: string; color: string } | null>(null);

  useEffect(() => {
    if (prevIndexRef.current === null) {
      prevIndexRef.current = state.currentPlayerIndex;
      return;
    }
    if (prevIndexRef.current !== state.currentPlayerIndex && currentPlayer) {
      setOverlay({ name: currentPlayer.name, color: currentPlayer.color });
      prevIndexRef.current = state.currentPlayerIndex;
    }
  }, [state.currentPlayerIndex, currentPlayer]);

  useEffect(() => {
    if (!overlay) return;
    const t = setTimeout(() => setOverlay(null), 900);
    return () => clearTimeout(t);
  }, [overlay]);

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

  const dartsUsedThisTurn = useMemo(() => {
    const round = state.round;
    const name = currentPlayer.name;
    let count = 0;
    for (let i = state.turnHistory.length - 1; i >= 0; i--) {
      const e = state.turnHistory[i];
      if (e.endTurn) break;
      if (e.playerName !== name || e.round !== round) break;
      if (e.cricketMarks?.length || e.miss) count += 1;
    }
    return count;
  }, [state.turnHistory, currentPlayer.name, state.round]);

  const canAddMore = dartsUsedThisTurn < 3;

  const handleMark = (num: number, count: 1 | 2 | 3) => {
    if (rowClosed[num] || !canAddMore) return;
    dispatch({ type: "MARK_CRICKET", number: num, count });
  };

  const handleMiss = () => {
    if (!canAddMore) return;
    dispatch({ type: "CRICKET_MISS" });
  };

  return (
    <div className="relative space-y-3">
      <AnimatePresence>
        {overlay && (
          <motion.div
            key={overlay.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`absolute inset-0 z-10 rounded-xl bg-gradient-to-b ${COLOR_BG[overlay.color] ?? "from-cyan-500/25 to-transparent"} flex items-center justify-center pointer-events-none backdrop-blur-[1px]`}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`font-bold text-xl sm:text-2xl ${COLOR_TEXT[overlay.color] ?? "text-cyan-300"}`}
            >
              {overlay.name}&apos;s turn
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1 min-h-[38px]">
          {turnTally.length > 0 && (
            <>
              This turn:{" "}
              {turnTally.map(({ num, count }) => (
                <span key={num} className="font-medium text-zinc-300">
                  {num === 25 ? "Bull" : num} ×{count}
                </span>
              ))}
            </>
          )}
          <span className="font-medium">
            {dartsUsedThisTurn}/3 darts
          </span>
        </div>
        <UndoButton />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CRICKET_NUMBERS.map((num) => {
          const closed = rowClosed[num];
          const disabled = closed || !canAddMore;
          const count = marks[num] ?? 0;
          const label = num === 25 ? "Bull" : num;
          return (
            <div
              key={num}
              className={`
                rounded-xl border overflow-hidden
                ${disabled ? "bg-zinc-800/50 border-zinc-700 opacity-70" : "bg-zinc-800 border-zinc-700"}
              `}
            >
              <div className="text-center py-2 font-bold text-xl sm:text-2xl text-white border-b border-zinc-700">
                {label}
              </div>
              <div className={`grid gap-0.5 p-1 ${num === 25 ? "grid-cols-2" : "grid-cols-3"}`}>
                <motion.button
                  type="button"
                  whileTap={disabled ? undefined : { scale: 0.95 }}
                  onClick={() => handleMark(num, 1)}
                  disabled={disabled}
                  className={`
                    min-h-[44px] rounded-lg font-mono font-bold text-sm
                    transition-colors
                    ${disabled ? "bg-zinc-800/50 text-zinc-500" : "bg-zinc-700 hover:bg-cyan-500/30 text-white"}
                  `}
                >
                  S
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={disabled ? undefined : { scale: 0.95 }}
                  onClick={() => handleMark(num, 2)}
                  disabled={disabled}
                  className={`
                    min-h-[44px] rounded-lg font-mono font-bold text-sm
                    transition-colors
                    ${disabled ? "bg-zinc-800/50 text-zinc-500" : "bg-zinc-700 hover:bg-emerald-500/30 text-white"}
                  `}
                >
                  D
                </motion.button>
                {num !== 25 && (
                  <motion.button
                    type="button"
                    whileTap={disabled ? undefined : { scale: 0.95 }}
                    onClick={() => handleMark(num, 3)}
                    disabled={disabled}
                    className={`
                      min-h-[44px] rounded-lg font-mono font-bold text-sm
                      transition-colors
                      ${disabled ? "bg-zinc-800/50 text-zinc-500" : "bg-zinc-700 hover:bg-amber-500/30 text-white"}
                    `}
                  >
                    T
                  </motion.button>
                )}
              </div>
              {count > 0 && (
                <div className="text-center py-0.5 text-xs text-zinc-400">
                  {count}/3
                </div>
              )}
            </div>
          );
        })}
        <motion.button
          type="button"
          aria-label="Miss – dart did not hit the board (scores 0)"
          whileTap={!canAddMore ? undefined : { scale: 0.95 }}
          onClick={handleMiss}
          disabled={!canAddMore}
          className={`
            rounded-xl border flex flex-col items-center justify-center gap-1 min-h-[100px]
            ${!canAddMore ? "bg-zinc-800/50 border-zinc-700 opacity-70 cursor-not-allowed" : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"}
          `}
        >
          <span className="font-bold text-lg text-white">Miss</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </motion.button>
      </div>
      <CurrentPlayerLabel playerName={currentPlayer.name} prominent className="w-full" />
    </div>
  );
}

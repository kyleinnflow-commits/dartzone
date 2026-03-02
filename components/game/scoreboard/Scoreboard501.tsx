"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, useSpring, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { TurnIndicator } from "./TurnIndicator";

const COLOR_BORDER: Record<string, string> = {
  cyan: "border-cyan-500",
  green: "border-emerald-500",
  amber: "border-amber-500",
  pink: "border-pink-500",
  violet: "border-violet-500",
  orange: "border-orange-500",
};

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  green: "text-emerald-400",
  amber: "text-amber-400",
  pink: "text-pink-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
};

function AnimatedScore({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const [display, setDisplay] = useState(value);
  useMotionValueEvent(spring, "change", (v) => setDisplay(Math.round(v)));
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  return <span>{display}</span>;
}

function useLastScores(): Record<string, number | undefined> {
  const { state } = useGame();
  return useMemo(() => {
    const last: Record<string, number | undefined> = {};
    for (let i = state.turnHistory.length - 1; i >= 0; i--) {
      const e = state.turnHistory[i];
      if (e.scoreEntered !== undefined && e.wasBust !== true && last[e.playerName] === undefined) {
        last[e.playerName] = e.scoreEntered;
      }
    }
    return last;
  }, [state.turnHistory]);
}

export function Scoreboard501() {
  const { state } = useGame();
  const lastScores = useLastScores();
  const players = state.players;
  const currentIndex = state.currentPlayerIndex;
  const currentPlayer = players[currentIndex];

  if (!currentPlayer) return null;

  return (
    <div className="space-y-2">
      <TurnIndicator round={state.round} currentPlayer={currentPlayer} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {players.map((player, idx) => {
          const remaining = state.scores501[player.name] ?? 0;
          const isActive = idx === currentIndex;
          const borderClass = COLOR_BORDER[player.color] ?? "border-cyan-500";
          const textClass = COLOR_TEXT[player.color] ?? "text-cyan-400";
          const lastScore = lastScores[player.name];

          return (
            <motion.div
              key={player.name}
              layout
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.99,
                opacity: isActive ? 1 : 0.85,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`
                rounded-lg p-2.5 sm:p-3 border-2 transition-colors
                ${isActive ? `border-2 ${borderClass} bg-zinc-900 shadow-lg` : "border-zinc-800 bg-zinc-900/70"}
              `}
            >
              <div className={`font-bold text-base sm:text-lg ${isActive ? textClass : "text-zinc-400"}`}>
                {player.name}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold tabular-nums text-white">
                  <AnimatedScore value={remaining} />
                </span>
                {remaining <= 170 && remaining > 0 && (
                  <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    Checkout
                  </span>
                )}
              </div>
              {lastScore !== undefined && (
                <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                  <span>Last: {lastScore}</span>
                  {lastScore === 180 && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-yellow-300 font-bold text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                      >
                        180!
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

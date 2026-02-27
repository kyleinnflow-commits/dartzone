"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { getCheckout } from "@/lib/checkouts";

export function CheckoutSuggest() {
  const { state } = useGame();

  const segments = useMemo(() => {
    if (state.mode !== "five01" && state.mode !== "three01") return null;
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return null;
    const remaining = state.scores501[currentPlayer.name] ?? 0;
    if (remaining > 170 || remaining <= 0) return null;
    const path = getCheckout(remaining);
    if (!path || path.length === 0) return null;
    return path.map((dart) => {
      if (dart.startsWith("T")) return { text: dart, type: "treble" as const };
      if (dart.startsWith("D")) return { text: dart, type: "double" as const };
      if (dart === "SB" || dart === "DB") return { text: dart, type: "bull" as const };
      return { text: dart, type: "single" as const };
    });
  }, [state.mode, state.players, state.currentPlayerIndex, state.scores501]);

  if (segments === null || segments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30"
    >
      <div className="text-xs font-medium text-amber-400/90 uppercase tracking-wide mb-1.5">
        Checkout
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-500">→</span>}
            <span
              className={`
                font-mono font-bold
                ${seg.type === "treble" ? "text-cyan-400" : ""}
                ${seg.type === "double" ? "text-emerald-400" : ""}
                ${seg.type === "single" ? "text-zinc-300" : ""}
                ${seg.type === "bull" ? "text-amber-400" : ""}
              `}
            >
              {seg.text}
            </span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

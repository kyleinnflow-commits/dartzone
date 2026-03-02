"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

export function UndoButton() {
  const { state, dispatch } = useGame();
  const canUndo = state.turnHistory.length > 0;

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "UNDO" })}
      disabled={!canUndo}
      className={`
        min-h-[38px] px-3 rounded-lg font-medium text-sm flex items-center gap-1.5
        transition-colors
        ${
          canUndo
            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
        }
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10h10a5 5 0 0 1 5 5v2" />
        <path d="m3 10 4-4" />
        <path d="M3 6v4" />
      </svg>
      Undo
    </button>
  );
}

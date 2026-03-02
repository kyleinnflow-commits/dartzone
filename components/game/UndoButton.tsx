"use client";

import { useGame } from "@/context/GameContext";

interface UndoButtonProps {
  /**
   * Optional callback run before dispatching global UNDO.
   * If it returns true, the global UNDO dispatch is skipped.
   */
  onBeforeUndo?: () => boolean;
}

export function UndoButton({ onBeforeUndo }: UndoButtonProps) {
  const { state, dispatch } = useGame();
  const hasHistory = state.turnHistory.length > 0;
  const canUndo = hasHistory || !!onBeforeUndo;

  const handleClick = () => {
    if (!canUndo) return;
    const handledLocally = onBeforeUndo?.() ?? false;
    if (!handledLocally && hasHistory) {
      dispatch({ type: "UNDO" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 5L3 9l4 4" />
        <path d="M4 9h16" />
      </svg>
      Undo
    </button>
  );
}

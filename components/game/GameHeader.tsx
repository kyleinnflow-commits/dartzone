"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import type { GameMode } from "@/types";

const MODE_LABELS: Record<GameMode, string> = {
  five01: "501",
  three01: "301",
  cricket: "Cricket",
  clock: "Around the Clock",
};

export function GameHeader() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleQuit = () => {
    dispatch({ type: "RESET_GAME" });
    setShowQuitConfirm(false);
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between py-3 px-1">
      <span className="text-lg font-semibold text-zinc-300">
        {MODE_LABELS[state.mode]}
      </span>
      <button
        type="button"
        onClick={() => setShowQuitConfirm(true)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Quit game"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M8 8l4-4 4 4" />
          <path d="M8 20l4 4 4-4" />
        </svg>
      </button>
      {showQuitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quit-title"
        >
          <div className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full border border-zinc-800">
            <h2 id="quit-title" className="text-xl font-bold text-white mb-2">
              Quit Game?
            </h2>
            <p className="text-zinc-400 mb-6">Progress will be lost.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuit}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

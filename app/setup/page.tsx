"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { PlayerInput } from "@/components/setup/PlayerInput";
import { loadSavedPlayers, savePlayers } from "@/lib/storage";
import type { GameMode } from "@/types";

const MODE_LABELS: Record<GameMode, string> = {
  five01: "501",
  three01: "301",
  cricket: "Cricket",
  clock: "Around the Clock",
};

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

export default function SetupPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [names, setNames] = useState<string[]>(["", ""]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const saved = loadSavedPlayers();
    if (saved.length >= MIN_PLAYERS) {
      setNames([...saved].slice(0, MAX_PLAYERS));
    } else if (saved.length === 1) {
      setNames([saved[0], ""]);
    }
  }, []);

  const modeLabel = MODE_LABELS[state.mode] ?? "Game";

  const addPlayer = useCallback(() => {
    if (names.length < MAX_PLAYERS) {
      setNames((prev) => [...prev, ""]);
    }
  }, [names.length]);

  const removePlayer = useCallback((index: number) => {
    setNames((prev) => {
      if (prev.length <= MIN_PLAYERS) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateName = useCallback((index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const playersWithNames = names.filter((n) => n.trim().length > 0);
  const canStart = playersWithNames.length >= MIN_PLAYERS;
  const showValidation = touched && !canStart;

  const handleStartGame = () => {
    setTouched(true);
    if (!canStart) return;
    const playerNames = names
      .map((n) => n.trim())
      .filter(Boolean);
    savePlayers(playerNames);
    dispatch({
      type: "SET_PLAYERS",
      players: playerNames.map((name) => ({ name, color: "" })),
    });
    dispatch({ type: "START_GAME" });
    router.push("/game");
  };

  const handleBack = () => {
    dispatch({ type: "RESET_GAME" });
    router.push("/");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-zinc-950 p-4 sm:p-6">
      <header className="flex items-center gap-4 mb-4">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          aria-label="Back to home"
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
            <path d="m12 19-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{modeLabel}</h1>
      </header>

      {state.mode === "cricket" && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800"
        >
          <span className="text-base font-medium text-zinc-300">
            Points Mode
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={state.cricketPointsMode}
            onClick={() =>
              dispatch({
                type: "SET_CRICKET_POINTS_MODE",
                enabled: !state.cricketPointsMode,
              })
            }
            className={`
              relative w-12 h-7 rounded-full transition-colors
              ${state.cricketPointsMode ? "bg-emerald-500" : "bg-zinc-700"}
            `}
          >
            <span
            className={`
              absolute top-1 w-5 h-5 rounded-full bg-white transition-transform
                ${state.cricketPointsMode ? "left-6" : "left-1"}
              `}
            />
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-300">Players</h2>
        <AnimatePresence mode="popLayout">
          {names.map((name, i) => (
            <PlayerInput
              key={i}
              index={i}
              value={name}
              colorIndex={i}
              canRemove={names.length > MIN_PLAYERS}
              onChange={(v) => updateName(i, v)}
              onRemove={() => removePlayer(i)}
              autoFocus={i === names.length - 1 && names.length > 2}
            />
          ))}
        </AnimatePresence>
        {names.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={addPlayer}
            className="w-full min-h-[44px] py-3 px-4 rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors font-medium"
          >
            Add Player
          </button>
        )}
      </div>

      {showValidation && (
        <p className="text-sm text-amber-400 mt-2">
          Add at least 2 player names to start.
        </p>
      )}

      <div className="mt-4 pt-4">
        <button
          type="button"
          onClick={handleStartGame}
          disabled={!canStart}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-colors
            min-h-[52px]
            ${
              canStart
                ? "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

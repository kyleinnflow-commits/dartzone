"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GameHeader } from "@/components/game/GameHeader";
import { UndoButton } from "@/components/game/UndoButton";
import { BustOverlay } from "@/components/game/BustOverlay";
import { Scoreboard501 } from "@/components/game/scoreboard/Scoreboard501";
import { ScoreboardCricket } from "@/components/game/scoreboard/ScoreboardCricket";
import { ScoreboardClock } from "@/components/game/scoreboard/ScoreboardClock";
import { CheckoutSuggest } from "@/components/game/CheckoutSuggest";
import { NumberPad } from "@/components/game/input/NumberPad";
import { QuickScores } from "@/components/game/input/QuickScores";
import { ThreeDartInput } from "@/components/game/input/ThreeDartInput";
import { CricketInput } from "@/components/game/input/CricketInput";
import { ClockInput } from "@/components/game/input/ClockInput";
import { STARTING_SCORE_501, STARTING_SCORE_301 } from "@/lib/constants";

const BUST_OVERLAY_MS = 1500;

export default function GamePage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [showBust, setShowBust] = useState(false);
  const [inputMode, setInputMode] = useState<"quick" | "keypad" | "darts">("darts");
  const lastBustIndexRef = useRef(-1);

  const is01 = state.mode === "five01" || state.mode === "three01";
  const maxScore = state.mode === "three01" ? STARTING_SCORE_301 : STARTING_SCORE_501;
  const currentPlayer = state.players[state.currentPlayerIndex];
  const remaining01 = currentPlayer ? (state.scores501[currentPlayer.name] ?? maxScore) : maxScore;

  useEffect(() => {
    if (state.gameStatus !== "active" || state.players.length === 0) {
      router.replace("/");
    }
  }, [state.gameStatus, state.players.length, router]);

  useEffect(() => {
    if (state.gameStatus === "finished") {
      router.replace("/summary");
    }
  }, [state.gameStatus, router]);

  useEffect(() => {
    if (!is01) return;
    const history = state.turnHistory;
    if (history.length === 0) return;
    const last = history[history.length - 1];
    if (last.wasBust && history.length - 1 > lastBustIndexRef.current) {
      lastBustIndexRef.current = history.length - 1;
      setShowBust(true);
      const t = setTimeout(() => setShowBust(false), BUST_OVERLAY_MS);
      return () => clearTimeout(t);
    }
  }, [state.turnHistory, is01]);

  const handleScore01 = useCallback(
    (score: number) => {
      dispatch({ type: "SCORE_01", score });
    },
    [dispatch]
  );

  if (state.gameStatus !== "active" || state.players.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col min-h-[100dvh]">
      <GameHeader />
      <main className="flex-1 overflow-auto p-4 pb-2 min-h-0">
        {state.mode === "five01" || state.mode === "three01" ? (
          <>
            <Scoreboard501 />
            <CheckoutSuggest />
          </>
        ) : state.mode === "cricket" ? (
          <ScoreboardCricket />
        ) : (
          <ScoreboardClock />
        )}
      </main>
      <footer className="flex-shrink-0 p-4 pt-2 bg-zinc-950 border-t border-zinc-800">
        {is01 && (
          <div className="flex justify-end items-center min-h-[52px] mb-2">
            <UndoButton />
          </div>
        )}
        {state.mode === "five01" || state.mode === "three01" ? (
          <>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setInputMode("darts")}
                className={`flex-1 min-h-[44px] rounded-lg font-medium ${inputMode === "darts" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "bg-zinc-800 text-zinc-400"}`}
              >
                3 Darts
              </button>
              <button
                type="button"
                onClick={() => setInputMode("quick")}
                className={`flex-1 min-h-[44px] rounded-lg font-medium ${inputMode === "quick" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "bg-zinc-800 text-zinc-400"}`}
              >
                Quick
              </button>
              <button
                type="button"
                onClick={() => setInputMode("keypad")}
                className={`flex-1 min-h-[44px] rounded-lg font-medium ${inputMode === "keypad" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "bg-zinc-800 text-zinc-400"}`}
              >
                Keypad
              </button>
            </div>
            {inputMode === "darts" ? (
              <ThreeDartInput
                onScore={handleScore01}
                remaining={remaining01}
                maxScore={maxScore}
              />
            ) : inputMode === "quick" ? (
              <QuickScores onScore={handleScore01} maxScore={maxScore} />
            ) : (
              <NumberPad onScore={handleScore01} maxScore={maxScore} />
            )}
          </>
        ) : state.mode === "cricket" ? (
          <>
            <div className="flex justify-end items-center min-h-[52px] mb-2">
              <UndoButton />
            </div>
            <CricketInput />
          </>
        ) : (
          <>
            <div className="flex justify-end items-center min-h-[52px] mb-2">
              <UndoButton />
            </div>
            <ClockInput />
          </>
        )}
      </footer>
      <BustOverlay show={showBust} />
    </div>
  );
}

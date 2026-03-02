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
import { Unified01Input, Unified01InputHandle } from "@/components/game/input/Unified01Input";
import { CricketInput } from "@/components/game/input/CricketInput";
import { ClockInput } from "@/components/game/input/ClockInput";
import { STARTING_SCORE_501, STARTING_SCORE_301 } from "@/lib/constants";

const BUST_OVERLAY_MS = 1500;

export default function GamePage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [showBust, setShowBust] = useState(false);
  const lastBustIndexRef = useRef(-1);
  const unifiedRef = useRef<Unified01InputHandle | null>(null);

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
    <div className="min-h-screen min-h-[100dvh] bg-zinc-950">
      <GameHeader />
      <main className="p-4 pb-2">
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
      <footer className="p-4 pt-2 bg-zinc-950 border-t border-zinc-800">
        {is01 && (
          <div className="flex justify-end items-center min-h-[52px] mb-2">
            <UndoButton
              onBeforeUndo={() => unifiedRef.current?.undoLastDart() ?? false}
            />
          </div>
        )}
        {state.mode === "five01" || state.mode === "three01" ? (
          <Unified01Input
            ref={unifiedRef}
            onScore={handleScore01}
            remaining={remaining01}
            maxScore={maxScore}
            playerName={currentPlayer?.name}
            historyLength={state.turnHistory.length}
          />
        ) : state.mode === "cricket" ? (
          <CricketInput />
        ) : (
          <ClockInput />
        )}
      </footer>
      <BustOverlay show={showBust} />
    </div>
  );
}

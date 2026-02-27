"use client";

import type { GameMode } from "@/types";
import type { PlayerStats } from "@/types";

interface StatTableProps {
  mode: GameMode;
  stats: PlayerStats[];
  winnerName: string;
}

export function StatTable({ mode, stats, winnerName }: StatTableProps) {
  return (
    <div className="space-y-3">
      {stats.map((s) => {
        const isWinner = s.playerName === winnerName;
        return (
          <div
            key={s.playerName}
            className={`
              rounded-xl p-4 border-2
              ${isWinner ? "border-cyan-500/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900/70"}
            `}
          >
            <div className="font-bold text-lg text-white mb-3">
              {s.playerName}
              {isWinner && (
                <span className="ml-2 text-cyan-400 text-sm font-medium">(Winner)</span>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {(mode === "five01" || mode === "three01") && (
                <>
                  <dt className="text-zinc-400">Rounds</dt>
                  <dd className="font-medium text-white">{s.roundsPlayed}</dd>
                  <dt className="text-zinc-400">Average</dt>
                  <dd className="font-medium text-white">{s.averagePerRound}</dd>
                  <dt className="text-zinc-400">Highest round</dt>
                  <dd className="font-medium text-white">{s.highestRound}</dd>
                  {s.checkoutAttempts !== undefined && (
                    <>
                      <dt className="text-zinc-400">Checkout %</dt>
                      <dd className="font-medium text-white">
                        {s.checkoutAttempts > 0 && s.checkoutSuccesses !== undefined
                          ? Math.round((s.checkoutSuccesses / s.checkoutAttempts) * 100)
                          : 0}
                        %
                      </dd>
                    </>
                  )}
                </>
              )}
              {mode === "cricket" && (
                <>
                  <dt className="text-zinc-400">Numbers closed</dt>
                  <dd className="font-medium text-white">{s.numbersClosed ?? 0}</dd>
                  {s.totalPoints !== undefined && (
                    <>
                      <dt className="text-zinc-400">Total points</dt>
                      <dd className="font-medium text-white">{s.totalPoints}</dd>
                    </>
                  )}
                  {s.marksPerRound !== undefined && (
                    <>
                      <dt className="text-zinc-400">Marks/round</dt>
                      <dd className="font-medium text-white">{s.marksPerRound}</dd>
                    </>
                  )}
                </>
              )}
              {mode === "clock" && (
                <>
                  {s.roundsToFinish !== undefined && s.roundsToFinish > 0 && (
                    <>
                      <dt className="text-zinc-400">Rounds to finish</dt>
                      <dd className="font-medium text-white">{s.roundsToFinish}</dd>
                    </>
                  )}
                  {s.firstAttemptPct !== undefined && (
                    <>
                      <dt className="text-zinc-400">First attempt %</dt>
                      <dd className="font-medium text-white">{s.firstAttemptPct}%</dd>
                    </>
                  )}
                </>
              )}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

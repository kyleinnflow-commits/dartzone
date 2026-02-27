"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { CRICKET_NUMBERS } from "@/lib/constants";

function CricketCell({
  marks,
  pointsMode,
  numberValue,
  isRowClosed,
  isCurrentPlayer,
}: {
  marks: number;
  pointsMode: boolean;
  numberValue: number;
  isRowClosed: boolean;
  isCurrentPlayer: boolean;
}) {
  const overflow = pointsMode && marks > 3 ? (marks - 3) * (numberValue === 25 ? 25 : numberValue) : 0;

  let content: React.ReactNode = "";
  if (marks === 1) content = "/";
  else if (marks === 2) content = "X";
  else if (marks >= 3) content = <>⊘{overflow > 0 && <span className="text-amber-400 text-xs ml-0.5">{overflow}</span>}</>;

  return (
    <motion.td
      initial={false}
      className={`
        min-w-[32px] w-[32px] sm:min-w-[40px] sm:w-[40px] h-10 sm:h-11
        text-center align-middle font-bold text-lg
        border border-zinc-700
        ${isRowClosed ? "bg-zinc-800/80 text-zinc-500" : "bg-zinc-900 text-white"}
        ${isCurrentPlayer ? "ring-1 ring-cyan-500/50" : ""}
      `}
    >
      {content}
    </motion.td>
  );
}

export function ScoreboardCricket() {
  const { state } = useGame();
  const players = state.players;
  const currentIndex = state.currentPlayerIndex;
  const pointsMode = state.cricketPointsMode;

  const rowClosed = useMemo(() => {
    const closed: Record<number, boolean> = {};
    for (const num of CRICKET_NUMBERS) {
      closed[num] = players.every((p) => (state.cricketState[p.name]?.marks[num] ?? 0) >= 3);
    }
    return closed;
  }, [state.cricketState, players]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-0">
        <thead>
          <tr>
            <th className="w-14 sm:w-12 md:w-10 text-left text-zinc-400 font-bold text-xl sm:text-2xl md:text-3xl py-2 pr-1">
              #
            </th>
            {players.map((p, i) => (
              <th
                key={p.name}
                className={`text-center font-medium text-sm py-2 px-0 min-w-[32px] sm:min-w-[40px] ${i === currentIndex ? "text-cyan-400" : "text-zinc-400"}`}
              >
                <span className="truncate max-w-[60px] sm:max-w-[80px] block mx-auto" title={p.name}>
                  {p.name.length > 6 ? p.name.slice(0, 5) + "…" : p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRICKET_NUMBERS.map((num) => (
            <tr
              key={num}
              className={rowClosed[num] ? "opacity-70" : ""}
            >
              <td className="border border-zinc-700 bg-zinc-800/50 text-zinc-300 font-bold text-xl sm:text-2xl md:text-3xl py-1 px-1 sm:px-2">
                {num === 25 ? "Bull" : num}
              </td>
              {players.map((p, i) => {
                const cstate = state.cricketState[p.name];
                const marks = cstate?.marks[num] ?? 0;
                return (
                  <CricketCell
                    key={p.name}
                    marks={marks}
                    pointsMode={pointsMode}
                    numberValue={num}
                    isRowClosed={rowClosed[num]}
                    isCurrentPlayer={i === currentIndex}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
        {pointsMode && (
          <tfoot>
            <tr>
              <td className="border border-zinc-700 bg-zinc-800 font-bold text-xl sm:text-2xl md:text-3xl text-zinc-300 py-2 px-1 sm:px-2">
                Pts
              </td>
              {players.map((p, i) => {
                const pts = state.cricketState[p.name]?.points ?? 0;
                return (
                  <td
                    key={p.name}
                    className={`border border-zinc-700 py-2 text-center font-bold text-lg ${i === currentIndex ? "text-cyan-400 bg-zinc-800" : "text-white bg-zinc-800/80"}`}
                  >
                    {pts}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

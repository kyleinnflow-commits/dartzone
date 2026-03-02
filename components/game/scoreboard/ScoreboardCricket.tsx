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
  if (marks === 1) content = <span className="text-2xl sm:text-3xl font-extrabold inline-block -rotate-[20deg]">/</span>;
  else if (marks === 2) content = <span className="text-2xl sm:text-3xl font-extrabold tracking-tighter">X</span>;
  else if (marks >= 3) content = (
    <>
      <span className="text-[1.75rem] sm:text-[2rem] font-extrabold inline-block">⊘</span>
      {overflow > 0 && <span className="text-amber-400 text-sm ml-0.5 font-semibold">{overflow}</span>}
    </>
  );

  return (
    <motion.td
      initial={false}
      className={`
        min-w-[36px] w-[36px] sm:min-w-[44px] sm:w-[44px] h-12 sm:h-14
        text-center align-middle font-bold
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

  const leftPlayers = useMemo(
    () => players.slice(0, Math.floor(players.length / 2)),
    [players]
  );
  const rightPlayers = useMemo(
    () => players.slice(Math.floor(players.length / 2)),
    [players]
  );

  const rowClosed = useMemo(() => {
    const closed: Record<number, boolean> = {};
    for (const num of CRICKET_NUMBERS) {
      closed[num] = players.every((p) => (state.cricketState[p.name]?.marks[num] ?? 0) >= 3);
    }
    return closed;
  }, [state.cricketState, players]);

  const renderPlayerCells = (playerList: typeof players) =>
    playerList.map((p) => {
      const i = players.indexOf(p);
      const isCurrent = i === currentIndex;
      return (
        <th
          key={p.name}
          className={`text-center font-medium text-base sm:text-lg py-2 px-0 min-w-[36px] sm:min-w-[44px] ${isCurrent ? "text-cyan-400" : "text-zinc-400"}`}
        >
          <span className="truncate max-w-[64px] sm:max-w-[88px] block mx-auto" title={p.name}>
            {p.name.length > 6 ? p.name.slice(0, 5) + "…" : p.name}
          </span>
        </th>
      );
    });

  const renderBodyCells = (playerList: typeof players, num: number) =>
    playerList.map((p) => {
      const i = players.indexOf(p);
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
    });

  const renderPointsCells = (playerList: typeof players) =>
    playerList.map((p) => {
      const i = players.indexOf(p);
      const pts = state.cricketState[p.name]?.points ?? 0;
      return (
        <td
          key={p.name}
          className={`border border-zinc-700 py-2 text-center font-bold text-lg ${i === currentIndex ? "text-cyan-400 bg-zinc-800" : "text-white bg-zinc-800/80"}`}
        >
          {pts}
        </td>
      );
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-0">
        <thead>
          <tr>
            {leftPlayers.length > 0 && renderPlayerCells(leftPlayers)}
            <th className="w-14 sm:w-16 md:w-14 text-center text-zinc-400 font-bold text-xl sm:text-2xl md:text-3xl py-2 px-1">
              #
            </th>
            {rightPlayers.length > 0 && renderPlayerCells(rightPlayers)}
          </tr>
        </thead>
        <tbody>
          {CRICKET_NUMBERS.map((num) => (
            <tr
              key={num}
              className={rowClosed[num] ? "opacity-70" : ""}
            >
              {leftPlayers.length > 0 && renderBodyCells(leftPlayers, num)}
              <td className="border border-zinc-700 bg-zinc-800/50 text-zinc-300 font-bold text-xl sm:text-2xl md:text-3xl py-1 px-1 text-center">
                {num === 25 ? "Bull" : num}
              </td>
              {rightPlayers.length > 0 && renderBodyCells(rightPlayers, num)}
            </tr>
          ))}
        </tbody>
        {pointsMode && (
          <tfoot>
            <tr>
              {leftPlayers.length > 0 && renderPointsCells(leftPlayers)}
              <td className="border border-zinc-700 bg-zinc-800 font-bold text-xl sm:text-2xl text-zinc-300 py-2 px-1 text-center">
                Pts
              </td>
              {rightPlayers.length > 0 && renderPointsCells(rightPlayers)}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

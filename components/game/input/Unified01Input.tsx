"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

interface DartThrow {
  number: number;
  mult: number;
}

function dartValue(d: DartThrow): number {
  if (d.number === 25) return d.mult === 2 ? 50 : 25;
  return d.number * d.mult;
}

function dartLabel(d: DartThrow): string {
  if (d.number === 25) return d.mult === 2 ? "DB" : "SB";
  const pre = d.mult === 1 ? "S" : d.mult === 2 ? "D" : "T";
  return `${pre}${d.number}`;
}

const QUICK_BUTTONS = [180, 140, 100, 60, 50, 45, 40, 36, 26, 0] as const;
const NUMBER_COLS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 25],
];
const DIGITS = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

interface Unified01InputProps {
  onScore: (score: number) => void;
  remaining: number;
  maxScore: number;
}

export function Unified01Input({ onScore, remaining, maxScore }: Unified01InputProps) {
  const [darts, setDarts] = useState<(DartThrow | null)[]>([null, null, null]);
  const [tempNumber, setTempNumber] = useState<number | null>(null);
  const [keypadValue, setKeypadValue] = useState("");

  const currentDartIndex = useMemo(() => {
    const i = darts.findIndex((d) => d === null);
    return i === -1 ? 2 : i;
  }, [darts]);

  const dartTotal = darts.reduce((s, d) => s + (d ? dartValue(d) : 0), 0);
  const allDartsFilled = darts.every(Boolean);
  const wouldBust = remaining - dartTotal < 0 || remaining - dartTotal === 1;
  const isCheckout = remaining - dartTotal === 0;
  const lastDartIsDouble =
    darts[2] != null &&
    (darts[2].mult === 2 || (darts[2].number === 25 && darts[2].mult === 2));
  const validCheckout = isCheckout && lastDartIsDouble;
  const canSubmitDarts =
    allDartsFilled && (validCheckout || !isCheckout || wouldBust);

  const keypadNum = parseInt(keypadValue, 10);
  const canSubmitKeypad =
    !Number.isNaN(keypadNum) && keypadNum >= 0 && keypadNum <= maxScore && keypadValue.length > 0;

  const applyMult = useCallback(
    (mult: 1 | 2 | 3) => {
      if (tempNumber === null) return;
      setDarts((prev) => {
        const next = [...prev];
        const idx = next.findIndex((d) => d === null);
        if (idx === -1) return prev;
        next[idx] = { number: tempNumber, mult };
        return next;
      });
      setTempNumber(null);
    },
    [tempNumber]
  );

  const submitDarts = useCallback(() => {
    if (!canSubmitDarts) return;
    onScore(dartTotal);
    setDarts([null, null, null]);
    setTempNumber(null);
  }, [canSubmitDarts, dartTotal, onScore]);

  const submitKeypad = useCallback(() => {
    if (!canSubmitKeypad) return;
    onScore(keypadNum);
    setKeypadValue("");
  }, [canSubmitKeypad, keypadNum, onScore]);

  const quickScore = useCallback(
    (score: number) => {
      if (score > maxScore || score > remaining) return;
      onScore(score);
    },
    [maxScore, remaining, onScore]
  );

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Column 1: Quick scores */}
      <div className="flex flex-col gap-1.5">
        <div className="text-xs text-zinc-500 font-medium">Quick</div>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_BUTTONS.filter((s) => s <= maxScore && s <= remaining).map((score) => (
            <motion.button
              key={score}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => quickScore(score)}
              className="min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-base"
            >
              {score}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Column 2: 3 Darts with number + S/D/T (or S/D for Bull) */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="text-xs text-zinc-500 font-medium">Bad at Math? Use this</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                flex-1 min-h-[36px] rounded-lg text-sm font-mono font-bold border flex items-center justify-center truncate px-0.5
                ${darts[i] ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}
                ${i === currentDartIndex && !darts[i] ? "ring-1 ring-cyan-500/60" : ""}
              `}
            >
              {darts[i] ? dartLabel(darts[i]) : i + 1}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {NUMBER_COLS.flat().map((n) => (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setTempNumber((prev) => (prev === n ? null : n))}
              className={`
                min-h-[36px] rounded-lg text-sm font-semibold
                ${tempNumber === n ? "bg-cyan-500/30 border border-cyan-500/60 text-cyan-200" : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"}
              `}
            >
              {n === 25 ? "B" : n}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          {tempNumber === 25 ? (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => applyMult(1)}
                className="flex-1 min-h-[36px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
              >
                SB
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => applyMult(2)}
                className="flex-1 min-h-[36px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
              >
                DB
              </motion.button>
            </>
          ) : (
            [1, 2, 3].map((mult) => (
              <motion.button
                key={mult}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => applyMult(mult as 1 | 2 | 3)}
                className="flex-1 min-h-[36px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
              >
                {mult === 1 ? "S" : mult === 2 ? "D" : "T"}
              </motion.button>
            ))
          )}
          <span className="text-sm text-zinc-400 font-semibold ml-1 tabular-nums w-9">
            {dartTotal}
          </span>
        </div>
        {(allDartsFilled && wouldBust) && (
          <span className="text-xs text-amber-400">BUST</span>
        )}
        {allDartsFilled && isCheckout && !lastDartIsDouble && (
          <span className="text-xs text-amber-400">Double out</span>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submitDarts}
          disabled={!canSubmitDarts}
          className={`
            min-h-[40px] rounded-xl font-bold text-base mt-0.5
            ${canSubmitDarts ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
          `}
        >
          Submit
        </motion.button>
      </div>

      {/* Column 3: Keypad */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="text-xs text-zinc-500 font-medium">Keypad</div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-h-[36px] px-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-end text-xl font-bold tabular-nums text-white">
            {keypadValue || "0"}
          </div>
          <button
            type="button"
            onClick={() => setKeypadValue((v) => v.slice(0, -1))}
            className="min-h-[36px] min-w-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400"
            aria-label="Backspace"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12H6" /><path d="M9 17l-5-5 5-5" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {DIGITS.map((d) => (
            <motion.button
              key={d}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setKeypadValue((v) => {
                  const next = v === "0" ? String(d) : v + String(d);
                  return parseInt(next, 10) <= maxScore && next.length <= 3 ? next : v;
                })
              }
              className="min-h-[36px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-base"
            >
              {d}
            </motion.button>
          ))}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submitKeypad}
          disabled={!canSubmitKeypad}
          className={`
            min-h-[40px] rounded-xl font-bold text-base
            ${canSubmitKeypad ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
          `}
        >
          Submit
        </motion.button>
      </div>
    </div>
  );
}

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

const NUMBER_GRID = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 25],
];

interface ThreeDartInputProps {
  onScore: (score: number) => void;
  remaining: number;
  maxScore: number;
}

export function ThreeDartInput({ onScore, remaining, maxScore }: ThreeDartInputProps) {
  const [darts, setDarts] = useState<(DartThrow | null)[]>([null, null, null]);
  const [tempNumber, setTempNumber] = useState<number | null>(null);

  const currentIndex = useMemo(() => {
    const i = darts.findIndex((d) => d === null);
    return i === -1 ? 2 : i;
  }, [darts]);

  const total = darts.reduce((s, d) => s + (d ? dartValue(d) : 0), 0);
  const allFilled = darts.every(Boolean);
  const wouldBust = remaining - total < 0 || remaining - total === 1;
  const isCheckout = remaining - total === 0;
  const lastDartIsDouble =
    darts[2] != null &&
    (darts[2].mult === 2 || (darts[2].number === 25 && darts[2].mult === 2));
  const validCheckout = isCheckout && lastDartIsDouble;
  const canSubmit = allFilled && (validCheckout || !isCheckout) && !wouldBust;

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

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onScore(total);
    setDarts([null, null, null]);
    setTempNumber(null);
  }, [canSubmit, total, onScore]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`
              flex-1 min-h-[40px] rounded-lg font-mono text-sm font-bold border flex items-center justify-center
              ${darts[i] ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}
              ${i === currentIndex && !darts[i] ? "ring-1 ring-cyan-500/60" : ""}
            `}
          >
            {darts[i] ? dartLabel(darts[i]) : `Dart ${i + 1}`}
          </div>
        ))}
      </div>
      <div className="text-center text-base font-semibold text-white">
        Total: {total}{" "}
        {allFilled && wouldBust && "(BUST)"}
        {allFilled && isCheckout && !lastDartIsDouble && " (finish on double)"}
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-2 space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {NUMBER_GRID.flat().map((n) => (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setTempNumber((prev) => (prev === n ? null : n))}
              className={`
                min-h-[36px] rounded-lg font-semibold text-sm
                ${tempNumber === n ? "bg-cyan-500/30 border border-cyan-500/60 text-cyan-200" : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"}
              `}
            >
              {n === 25 ? "B" : n}
            </motion.button>
          ))}
        </div>
        {tempNumber !== null && (
          <div className="flex gap-1.5 flex-wrap">
            {tempNumber === 25 ? (
              <>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyMult(1)}
                  className="flex-1 min-h-[40px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
                >
                  SB
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyMult(2)}
                  className="flex-1 min-h-[40px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
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
                  className="flex-1 min-h-[40px] rounded-lg bg-zinc-700 hover:bg-cyan-500/20 border border-zinc-600 font-mono font-bold text-sm"
                >
                  {mult === 1 ? "S" : mult === 2 ? "D" : "T"}
                  {tempNumber}
                </motion.button>
              ))
            )}
            <button
              type="button"
              onClick={() => setTempNumber(null)}
              className="min-h-[40px] px-3 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`
          w-full min-h-[48px] rounded-xl font-bold text-lg
          ${canSubmit ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
        `}
      >
        Submit
      </motion.button>
    </div>
  );
}

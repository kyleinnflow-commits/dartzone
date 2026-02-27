"use client";

import { useState, useCallback } from "react";
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

interface ThreeDartInputProps {
  onScore: (score: number) => void;
  remaining: number;
  maxScore: number;
}

export function ThreeDartInput({ onScore, remaining, maxScore }: ThreeDartInputProps) {
  const [darts, setDarts] = useState<(DartThrow | null)[]>([null, null, null]);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [tempNumber, setTempNumber] = useState<number | null>(null);

  const total = darts.reduce((s, d) => s + (d ? dartValue(d) : 0), 0);
  const allFilled = darts.every(Boolean);
  const wouldBust = remaining - total < 0 || remaining - total === 1;
  const isCheckout = remaining - total === 0;
  const lastDartIsDouble = darts[2] != null && (darts[2].mult === 2 || (darts[2].number === 25 && darts[2].mult === 2));
  const validCheckout = isCheckout && lastDartIsDouble;
  const canSubmit = allFilled && (validCheckout || !isCheckout) && !wouldBust;

  const handleDartSelect = useCallback(
    (index: number, d: DartThrow) => {
      setDarts((prev) => {
        const next = [...prev];
        next[index] = d;
        return next;
      });
      setPickingIndex(null);
      setTempNumber(null);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onScore(total);
    setDarts([null, null, null]);
  }, [canSubmit, total, onScore]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center justify-between">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPickingIndex(i)}
            className={`
              flex-1 min-h-[48px] rounded-xl font-mono font-bold text-sm border transition-colors
              ${darts[i] ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"}
            `}
          >
            {darts[i] ? dartLabel(darts[i]) : `Dart ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="text-center text-lg font-semibold text-white">
        Total: {total} {allFilled && wouldBust && "(BUST)"}
        {allFilled && isCheckout && !lastDartIsDouble && " (finish on double)"}
      </div>

      {pickingIndex !== null && (
        <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 space-y-2">
          <div className="text-xs text-zinc-400 font-medium">Dart {pickingIndex + 1}</div>
          {tempNumber === null ? (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {numbers.map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTempNumber(n)}
                  className="min-h-[40px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm"
                >
                  {n === 25 ? "Bull" : n}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {tempNumber === 25 ? (
                [
                  { mult: 1, label: "SB" },
                  { mult: 2, label: "DB" },
                ].map(({ mult, label }) => (
                  <motion.button
                    key={label}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDartSelect(pickingIndex, { number: 25, mult })}
                    className="min-h-[44px] px-4 rounded-xl bg-zinc-800 hover:bg-cyan-500/20 border border-zinc-700 font-mono font-bold"
                  >
                    {label}
                  </motion.button>
                ))
              ) : (
                [1, 2, 3].map((mult) => (
                  <motion.button
                    key={mult}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDartSelect(pickingIndex, { number: tempNumber, mult })}
                    className="min-h-[44px] px-4 rounded-xl bg-zinc-800 hover:bg-cyan-500/20 border border-zinc-700 font-mono font-bold"
                  >
                    {mult === 1 ? "S" : mult === 2 ? "D" : "T"}
                    {tempNumber}
                  </motion.button>
                ))
              )}
              <button
                type="button"
                onClick={() => setTempNumber(null)}
                className="min-h-[44px] px-3 rounded-xl bg-zinc-800 text-zinc-400 text-sm"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}

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

"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface NumberPadProps {
  onScore: (score: number) => void;
  maxScore: number;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export function NumberPad({ onScore, maxScore }: NumberPadProps) {
  const [value, setValue] = useState("");

  const append = useCallback(
    (d: number) => {
      const next = value === "0" ? String(d) : value + String(d);
      const num = parseInt(next, 10);
      if (num <= maxScore && next.length <= 3) setValue(next);
    },
    [value, maxScore]
  );

  const backspace = useCallback(() => {
    setValue((v) => v.slice(0, -1));
  }, []);

  const submit = useCallback(() => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0 || num > maxScore) return;
    onScore(num);
    setValue("");
  }, [value, maxScore, onScore]);

  const num = parseInt(value, 10);
  const canSubmit =
    !Number.isNaN(num) && num >= 0 && num <= maxScore && value.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-h-[48px] px-4 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-end text-2xl font-bold tabular-nums text-white">
          {value || "0"}
        </div>
        <button
          type="button"
          onClick={backspace}
          className="min-h-[48px] min-w-[48px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400"
          aria-label="Backspace"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12H6" />
            <path d="M9 17l-5-5 5-5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map((d) => (
          <motion.button
            key={d}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => append(d)}
            className="min-h-[48px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-lg"
          >
            {d}
          </motion.button>
        ))}
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={submit}
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

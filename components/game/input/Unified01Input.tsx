"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "framer-motion";

interface DartThrow {
  number: number;
  mult: number;
}

function dartValue(d: DartThrow): number {
  if (d.number === 0) return 0;
  if (d.number === 25) return d.mult === 2 ? 50 : 25;
  return d.number * d.mult;
}

function dartLabel(d: DartThrow): string {
  if (d.number === 25) return d.mult === 2 ? "DB" : "SB";
  if (d.number === 0) return "MISS";
  const pre = d.mult === 1 ? "S" : d.mult === 2 ? "D" : "T";
  return `${pre}${d.number}`;
}

type SegmentMode = "single" | "double" | "treble";

const MODES: { id: SegmentMode; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "double", label: "Double" },
  { id: "treble", label: "Treble" },
];

const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

interface Unified01InputProps {
  onScore: (score: number) => void;
  remaining: number;
  maxScore: number;
  playerName?: string;
  historyLength: number;
}

export interface Unified01InputHandle {
  /**
   * Undo the last local dart entry for this turn.
   * Returns true if a dart was removed, false if there was nothing to undo.
   */
  undoLastDart: () => boolean;
}

export const Unified01Input = forwardRef<Unified01InputHandle, Unified01InputProps>(
  function Unified01Input({ onScore, remaining, maxScore, playerName, historyLength }, ref) {
  const [mode, setMode] = useState<SegmentMode>("single");
  const [darts, setDarts] = useState<(DartThrow | null)[]>([null, null, null]);

  const currentDartIndex = useMemo(() => {
    const i = darts.findIndex((d) => d === null);
    return i === -1 ? 2 : i;
  }, [darts]);

  const dartTotal = darts.reduce((s, d) => s + (d ? dartValue(d) : 0), 0);
  const allDartsFilled = darts.every(Boolean);
  const wouldBust = remaining - dartTotal < 0 || remaining - dartTotal === 1;
  const isCheckout = remaining - dartTotal === 0;
  const lastDart = darts[2];
  const lastDartIsDouble =
    lastDart != null &&
    lastDart.number !== 0 &&
    (lastDart.mult === 2 || (lastDart.number === 25 && lastDart.mult === 2));
  const validCheckout = isCheckout && lastDartIsDouble;
  const canSubmit = allDartsFilled && (validCheckout || !isCheckout || wouldBust);

  const resetDarts = () => setDarts([null, null, null]);

  // Track last submitted darts per player so we can restore them when Undo
  // takes us back to a previous player's completed turn.
  const lastSubmittedRef = useRef<Record<string, DartThrow[]>>({});
  const prevHistoryLenRef = useRef<number | undefined>(undefined);
  const prevPlayerRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!playerName) return;
    const prevLen = prevHistoryLenRef.current;
    const prevPlayer = prevPlayerRef.current;

    if (prevLen === undefined) {
      prevHistoryLenRef.current = historyLength;
      prevPlayerRef.current = playerName;
      return;
    }

    if (historyLength > prevLen) {
      // Moved forward (submit) - if we changed players and this is a fresh turn,
      // default back to Single.
      if (playerName !== prevPlayer && darts.every((d) => d === null)) {
        setMode("single");
      }
    } else if (historyLength < prevLen) {
      // Undo - if we moved back to a previous player, restore their last submitted darts
      // if we have them stored.
      if (playerName !== prevPlayer) {
        const stored = lastSubmittedRef.current[playerName];
        if (stored && stored.length) {
          setDarts(stored);
        }
      }
    }

    prevHistoryLenRef.current = historyLength;
    prevPlayerRef.current = playerName;
  }, [playerName, historyLength, darts]);

  useImperativeHandle(
    ref,
    () => ({
      undoLastDart: () => {
        const idx = [...darts].reverse().findIndex((d) => d !== null);
        if (idx === -1) return false;
        const realIndex = 2 - idx;
        setDarts((prev) => {
          const next = [...prev];
          next[realIndex] = null;
          return next;
        });
        return true;
      },
    }),
    [darts],
  );

  const pushDart = useCallback((dart: DartThrow) => {
    setDarts((prev) => {
      const next = [...prev];
      const idx = next.findIndex((d) => d === null);
      if (idx === -1) return prev;
      next[idx] = dart;
      return next;
    });
  }, []);

  const handleNumberClick = (n: number) => {
    let number = n;
    let mult: 1 | 2 | 3 = 1;

    if (mode === "single") mult = 1;
    else if (mode === "double") mult = 2;
    else if (mode === "treble") mult = 3;

    pushDart({ number, mult });
  };

  const handleBullSingle = () => {
    pushDart({ number: 25, mult: 1 });
  };

  const handleBullDouble = () => {
    pushDart({ number: 25, mult: 2 });
  };

  const handleMiss = () => {
    pushDart({ number: 0, mult: 0 });
  };

  const submit = () => {
    if (!canSubmit) return;
    if (playerName) {
      lastSubmittedRef.current[playerName] = (darts.filter(
        (d): d is DartThrow => d !== null,
      ) as DartThrow[]);
    }
    onScore(dartTotal);
    resetDarts();
  };

  const renderValueText = (n: number) => {
    if (mode === "single") return null;
    if (mode === "double") return n * 2;
    if (mode === "treble") return n * 3;
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                flex-1 min-h-[32px] rounded-lg border text-[10px] font-mono font-bold flex items-center justify-center
                ${darts[i]
                  ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-200"
                  : i === currentDartIndex
                    ? "bg-zinc-800 border-cyan-500/40 text-zinc-300"
                    : "bg-zinc-900 border-zinc-700 text-zinc-500"}
              `}
            >
              {darts[i] ? dartLabel(darts[i]!) : `D${i + 1}`}
            </div>
          ))}
        </div>
        <div className="ml-2 text-right">
          <div className="text-[11px] text-zinc-400">Total</div>
          <div className="text-sm font-semibold text-white tabular-nums">
            {dartTotal}
            {allDartsFilled && wouldBust && <span className="ml-1 text-amber-400">BUST</span>}
            {allDartsFilled && isCheckout && !lastDartIsDouble && (
              <span className="ml-1 text-amber-400">Double out</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 text-xs">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`
              flex-1 min-h-[28px] rounded-full border px-2 font-medium
              ${mode === m.id
                ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-200"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"}
            `}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {NUMBERS.map((n) => {
          const sub = renderValueText(n);
          return (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick(n)}
              className="min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex flex-col items-center justify-center text-sm"
            >
              <span className="font-bold text-base leading-none">{n}</span>
              {sub !== null && (
                <span className="text-[10px] text-zinc-400 leading-none mt-0.5">{sub}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleBullDouble}
          className="min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-xs font-semibold flex flex-col items-center justify-center"
        >
          <span className="text-sm font-bold">Bull</span>
          <span className="text-[10px] text-zinc-400">50</span>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleBullSingle}
          className="min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-xs font-semibold flex flex-col items-center justify-center"
        >
          <span className="text-sm font-bold">Outer</span>
          <span className="text-[10px] text-zinc-400">25</span>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleMiss}
          className="min-h-[40px] rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-semibold flex items-center justify-center"
        >
          MISS
        </motion.button>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={!canSubmit}
        className={`
          w-full min-h-[44px] rounded-xl font-bold text-lg
          ${canSubmit ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
        `}
      >
        Submit
      </motion.button>
    </div>
  );
});

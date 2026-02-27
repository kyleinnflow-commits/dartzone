"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { GameModeCard } from "@/components/home/GameModeCard";
import type { GameMode } from "@/types";

const MODES: {
  mode: GameMode;
  title: string;
  description: string;
  accentClass: string;
  borderAccentClass: string;
}[] = [
  {
    mode: "five01",
    title: "501",
    description: "Classic countdown from 501. Double to finish.",
    accentClass: "text-cyan-400",
    borderAccentClass: "border-l-4 border-l-cyan-500",
  },
  {
    mode: "three01",
    title: "301",
    description: "Quick game. Start at 301, double out.",
    accentClass: "text-emerald-400",
    borderAccentClass: "border-l-4 border-l-emerald-500",
  },
  {
    mode: "cricket",
    title: "Cricket",
    description: "Close 15-20 and Bull. Outscore your opponent.",
    accentClass: "text-amber-400",
    borderAccentClass: "border-l-4 border-l-amber-500",
  },
  {
    mode: "clock",
    title: "Around the Clock",
    description: "Hit 1-20 in order, then Bull to win.",
    accentClass: "text-pink-400",
    borderAccentClass: "border-l-4 border-l-pink-500",
  },
];

export default function Home() {
  const router = useRouter();
  const { dispatch } = useGame();

  const handleSelectMode = (mode: GameMode) => {
    dispatch({ type: "SET_MODE", mode });
    router.push("/setup");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-4 sm:p-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center pt-8 pb-6 sm:pt-10 sm:pb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Dart<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">Zone</span>
        </h1>
      </motion.header>

      <main className="flex-1 max-w-2xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {MODES.map((m, i) => (
          <GameModeCard
            key={m.mode}
            mode={m.mode}
            title={m.title}
            description={m.description}
            accentClass={m.accentClass}
            borderAccentClass={m.borderAccentClass}
            onSelect={() => handleSelectMode(m.mode)}
            index={i}
          />
        ))}
      </main>
    </div>
  );
}

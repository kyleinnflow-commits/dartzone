"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BustOverlayProps {
  show: boolean;
}

export function BustOverlay({ show }: BustOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none"
          aria-live="polite"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-6xl sm:text-8xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          >
            BUST!
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

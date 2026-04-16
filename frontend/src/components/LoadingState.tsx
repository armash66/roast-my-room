/**
 * LoadingState — Cinematic loading with stages and ambient glow.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import type { RoastStage } from "../types";

interface LoadingProps {
  statusMessage: string;
  stage: RoastStage;
}

const funMessages = [
  "analyzing your life choices...",
  "consulting interior design lawyers...",
  "measuring the disappointment levels...",
  "cross-referencing with IKEA crime database...",
  "preparing emotional support animals...",
  "calculating therapy costs...",
];

const stages = [
  { key: "analyzing", label: "Scanning", progress: 33 },
  { key: "roasting", label: "Roasting", progress: 66 },
  { key: "scoring", label: "Scoring", progress: 100 },
];

export function LoadingState({ statusMessage, stage }: LoadingProps) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % funMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentProgress = stages.find((s) => s.key === stage)?.progress ?? 20;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center py-16"
    >
      {/* Pulsing flame icon */}
      <motion.div
        className="relative mb-8"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame size={56} className="text-orange-500 relative z-10" />
        <motion.div
          className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl scale-[3]"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [2.5, 3.5, 2.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Status message */}
      <div className="h-8 mb-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="text-neutral-400 text-sm font-medium text-center"
          >
            {statusMessage || funMessages[messageIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-64 relative">
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Stage labels */}
        <div className="flex justify-between mt-3">
          {stages.map((s) => (
            <span
              key={s.key}
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                stage === s.key
                  ? "text-orange-400"
                  : currentProgress >= s.progress
                    ? "text-neutral-400"
                    : "text-neutral-700"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

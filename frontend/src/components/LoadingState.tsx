/**
 * LoadingState — Animated loading screen with rotating messages.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface LoadingStateProps {
  statusMessage?: string;
  stage?: string;
}

const loadingMessages = [
  "analyzing your life choices...",
  "consulting interior design lawyers...",
  "preparing emotional support...",
  "measuring the chaos...",
  "judging your taste quietly...",
  "contacting HGTV for an intervention...",
  "calculating furniture crimes...",
  "evaluating your lighting sins...",
  "searching for redeeming qualities...",
  "drafting a strongly worded letter...",
];

export function LoadingState({ statusMessage, stage }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (statusMessage) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [statusMessage]);

  const displayMessage = statusMessage || loadingMessages[messageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Pulsing fire animation */}
      <motion.div
        className="relative mb-8"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full" />
        <Flame size={64} className="text-orange-500 relative z-10" />
      </motion.div>

      {/* Stage indicator */}
      {stage && (
        <div className="flex items-center gap-2 mb-4">
          {["analyzing", "roasting", "scoring"].map((s, i) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === stage
                  ? "w-8 bg-orange-500"
                  : ["analyzing", "roasting", "scoring"].indexOf(stage) > i
                    ? "w-6 bg-orange-500/50"
                    : "w-4 bg-neutral-700"
              }`}
              animate={s === stage ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      )}

      {/* Rotating message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-neutral-400 text-lg font-medium italic"
        >
          {displayMessage}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

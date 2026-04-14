/**
 * RoastDisplay — Renders the roast text with typewriter effect.
 * Highlights the worst offender in red/bold.
 */

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface RoastDisplayProps {
  text: string;
  worstOffender: string;
  isStreaming: boolean;
}

export function RoastDisplay({ text, worstOffender, isStreaming }: RoastDisplayProps) {
  // Highlight worst offender in the text
  const renderText = () => {
    if (!worstOffender || !text) return text;

    const regex = new RegExp(`(${escapeRegex(worstOffender)})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="text-red-400 font-bold underline decoration-red-500/50 decoration-2 underline-offset-2"
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Roast text */}
      <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 p-6 mb-4">
        <div className="absolute -top-3 left-4 px-3 py-0.5 bg-orange-500 rounded-full text-xs font-bold text-white uppercase tracking-wider">
          The Roast
        </div>

        <p className="text-neutral-200 text-lg leading-relaxed mt-2 font-medium">
          {renderText()}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-orange-500 ml-1 align-middle"
            />
          )}
        </p>
      </div>

      {/* Worst offender callout */}
      {worstOffender && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center gap-3 px-4 py-3 bg-red-950/40 border border-red-900/50 rounded-xl"
        >
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">
              Worst Offender
            </span>
            <p className="text-red-300 font-bold">{worstOffender}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

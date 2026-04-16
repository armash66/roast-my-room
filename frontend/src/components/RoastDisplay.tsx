/**
 * RoastDisplay — Dramatic roast text reveal with typewriter cursor and worst offender callout.
 */

import { motion } from "framer-motion";
import { AlertTriangle, Quote } from "lucide-react";

interface RoastDisplayProps {
  text: string;
  worstOffender: string;
  isStreaming: boolean;
}

export function RoastDisplay({ text, worstOffender, isStreaming }: RoastDisplayProps) {
  // Highlight worst offender in the text
  const renderText = () => {
    if (!worstOffender || !text) return text;

    const regex = new RegExp(`(${worstOffender.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-red-400 font-bold underline decoration-red-500/50 underline-offset-2">
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
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Roast text card */}
      <div className="relative rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06]">
        <Quote size={20} className="text-orange-500/30 mb-3" />
        <p className="text-neutral-200 text-lg leading-relaxed font-medium">
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
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12]"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 mt-0.5">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-red-400/70 uppercase tracking-wider mb-0.5">
              Worst Offender
            </p>
            <p className="text-red-300 font-bold text-sm">{worstOffender}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

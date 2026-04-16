/**
 * ModeSelector — Premium mode selector with animated glow rings.
 */

import { motion } from "framer-motion";
import type { RoastMode } from "../types";

interface ModeSelectorProps {
  selected: RoastMode;
  onChange: (mode: RoastMode) => void;
  disabled?: boolean;
}

const modes: { value: RoastMode; label: string; emoji: string; tag: string }[] = [
  { value: "mild",     label: "Mild",     emoji: "😏", tag: "playful sarcasm" },
  { value: "brutal",   label: "Brutal",   emoji: "💀", tag: "no mercy" },
  { value: "unhinged", label: "Unhinged", emoji: "🤯", tag: "pure chaos" },
];

const modeStyles: Record<RoastMode, { gradient: string; glow: string; border: string }> = {
  mild: {
    gradient: "from-amber-500/20 to-yellow-500/10",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.15)]",
    border: "border-amber-500/30",
  },
  brutal: {
    gradient: "from-red-500/20 to-rose-500/10",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    border: "border-red-500/30",
  },
  unhinged: {
    gradient: "from-purple-500/20 to-pink-500/10",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    border: "border-purple-500/30",
  },
};

export function ModeSelector({ selected, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wider">
        Roast Intensity
      </label>

      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const isSelected = selected === mode.value;
          const style = modeStyles[mode.value];

          return (
            <motion.button
              key={mode.value}
              onClick={() => onChange(mode.value)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              className={`
                relative overflow-hidden rounded-xl p-5 border transition-all duration-500
                ${
                  isSelected
                    ? `${style.border} ${style.glow} bg-white/[0.04]`
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Background gradient */}
              <AnimatedBg isActive={isSelected} gradient={style.gradient} />

              <div className="relative z-10 flex flex-col items-center gap-2">
                <motion.span
                  className="text-3xl"
                  animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {mode.emoji}
                </motion.span>
                <span className={`font-bold text-sm ${isSelected ? "text-white" : "text-neutral-400"}`}>
                  {mode.label}
                </span>
                <span className="text-[11px] text-neutral-600 font-medium uppercase tracking-wider">
                  {mode.tag}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedBg({ isActive, gradient }: { isActive: boolean; gradient: string }) {
  if (!isActive) return null;
  return (
    <motion.div
      layoutId="mode-glow"
      className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
  );
}

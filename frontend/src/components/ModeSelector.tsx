/**
 * ModeSelector — Animated roast mode selector.
 * Three modes: mild, brutal, unhinged with distinct personalities.
 */

import { motion } from "framer-motion";
import type { RoastMode } from "../types";

interface ModeSelectorProps {
  selected: RoastMode;
  onChange: (mode: RoastMode) => void;
  disabled?: boolean;
}

const modes: { value: RoastMode; label: string; emoji: string; description: string }[] = [
  {
    value: "mild",
    label: "Mild",
    emoji: "😏",
    description: "playful sarcasm",
  },
  {
    value: "brutal",
    label: "Brutal",
    emoji: "💀",
    description: "no mercy",
  },
  {
    value: "unhinged",
    label: "Unhinged",
    emoji: "🤯",
    description: "pure chaos",
  },
];

const modeColors: Record<RoastMode, string> = {
  mild: "from-yellow-500 to-orange-400",
  brutal: "from-red-600 to-rose-500",
  unhinged: "from-purple-600 to-pink-500",
};

const modeBorderColors: Record<RoastMode, string> = {
  mild: "border-yellow-500/50",
  brutal: "border-red-500/50",
  unhinged: "border-purple-500/50",
};

const modeGlows: Record<RoastMode, string> = {
  mild: "shadow-[0_0_20px_rgba(234,179,8,0.2)]",
  brutal: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
  unhinged: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
};

export function ModeSelector({ selected, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-400 mb-3">
        Select roast intensity
      </label>

      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const isSelected = selected === mode.value;

          return (
            <motion.button
              key={mode.value}
              onClick={() => onChange(mode.value)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.03 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              className={`
                relative overflow-hidden rounded-xl p-4 border transition-all duration-300
                ${
                  isSelected
                    ? `${modeBorderColors[mode.value]} ${modeGlows[mode.value]} bg-neutral-800/80`
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Active gradient background */}
              {isSelected && (
                <motion.div
                  layoutId="mode-bg"
                  className={`absolute inset-0 bg-gradient-to-br ${modeColors[mode.value]} opacity-10`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.span
                  className="text-2xl"
                  animate={isSelected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {mode.emoji}
                </motion.span>
                <span
                  className={`font-bold text-sm ${
                    isSelected ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {mode.label}
                </span>
                <span className="text-xs text-neutral-500">{mode.description}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

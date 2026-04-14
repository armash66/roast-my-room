/**
 * ScoreBoard — Animated score bars for chaos, furniture crime, lighting sin, overall disaster.
 */

import { motion } from "framer-motion";
import type { RoastScores } from "../types";

interface ScoreBoardProps {
  scores: RoastScores;
}

const scoreConfig = [
  {
    key: "chaos_level" as const,
    label: "Chaos Level",
    emoji: "🌪️",
    gradient: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-500/10",
  },
  {
    key: "furniture_crime" as const,
    label: "Furniture Crime",
    emoji: "🪑",
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "lighting_sin" as const,
    label: "Lighting Sin",
    emoji: "💡",
    gradient: "from-red-500 to-pink-500",
    bg: "bg-red-500/10",
  },
  {
    key: "overall_disaster" as const,
    label: "Overall Disaster",
    emoji: "☠️",
    gradient: "from-pink-500 to-purple-500",
    bg: "bg-pink-500/10",
  },
];

export function ScoreBoard({ scores }: ScoreBoardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
        <h3 className="text-neutral-400 text-sm font-semibold uppercase tracking-wider mb-5">
          Damage Report
        </h3>

        <div className="space-y-5">
          {scoreConfig.map((config, index) => {
            const value = scores[config.key];
            const percentage = (value / 10) * 100;

            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
              >
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-neutral-300 font-medium text-sm">
                      {config.label}
                    </span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.5 + 0.1 * index,
                      type: "spring",
                      stiffness: 400,
                    }}
                    className={`
                      text-lg font-black tabular-nums
                      ${value >= 8 ? "text-red-400" : value >= 5 ? "text-orange-400" : "text-yellow-400"}
                    `}
                  >
                    {value}/10
                  </motion.span>
                </div>

                {/* Bar */}
                <div className={`h-3 rounded-full ${config.bg} overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.4 + 0.15 * index,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${config.gradient} relative`}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        delay: 1 + 0.15 * index,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall verdict */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 pt-4 border-t border-neutral-800 text-center"
        >
          <span className="text-neutral-500 text-sm">Verdict: </span>
          <span className="text-lg font-bold">
            {getVerdict(scores.overall_disaster)}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function getVerdict(score: number): string {
  if (score >= 9) return "🏚️ Condemnation Notice Issued";
  if (score >= 7) return "🚨 FEMA Has Been Notified";
  if (score >= 5) return "😬 Questionable At Best";
  if (score >= 3) return "🤷 Could Be Worse...";
  return "✨ Surprisingly Decent";
}

/**
 * ScoreBoard — Animated score bars with gradient fills and staggered reveals.
 */

import { motion } from "framer-motion";
import type { RoastScores } from "../types";

interface ScoreBoardProps {
  scores: RoastScores;
}

const scoreCategories: { key: keyof RoastScores; label: string; icon: string }[] = [
  { key: "chaos_level", label: "Chaos Level", icon: "🌀" },
  { key: "furniture_crime", label: "Furniture Crime", icon: "🪑" },
  { key: "lighting_sin", label: "Lighting Sin", icon: "💡" },
  { key: "overall_disaster", label: "Overall Disaster", icon: "💥" },
];

function getScoreColor(score: number): string {
  if (score >= 8) return "from-red-500 to-rose-600";
  if (score >= 5) return "from-orange-500 to-amber-500";
  return "from-emerald-500 to-teal-500";
}

function getVerdict(avg: number): { text: string; color: string } {
  if (avg >= 8) return { text: "CONDEMNATION NOTICE ISSUED", color: "text-red-400" };
  if (avg >= 6) return { text: "DEEPLY CONCERNING", color: "text-orange-400" };
  if (avg >= 4) return { text: "ROOM NEEDS AN INTERVENTION", color: "text-amber-400" };
  return { text: "SURPRISINGLY DECENT", color: "text-emerald-400" };
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  const avg =
    (scores.chaos_level + scores.furniture_crime + scores.lighting_sin + scores.overall_disaster) / 4;
  const verdict = getVerdict(avg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06] space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          Damage Report
        </h3>
        <span className="text-xs font-bold text-neutral-600">
          AVG: {avg.toFixed(1)}/10
        </span>
      </div>

      <div className="space-y-4">
        {scoreCategories.map((cat, i) => {
          const score = scores[cat.key];
          const gradient = getScoreColor(score);

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-sm font-medium text-neutral-300">{cat.label}</span>
                </div>
                <motion.span
                  className="text-sm font-bold text-white tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  {score}/10
                </motion.span>
              </div>

              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full relative`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${score * 10}%` }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 shimmer" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pt-3 border-t border-white/[0.06] text-center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 mb-1">
          Verdict
        </p>
        <p className={`text-sm font-extrabold ${verdict.color} tracking-wide`}>
          {verdict.text}
        </p>
      </motion.div>
    </motion.div>
  );
}

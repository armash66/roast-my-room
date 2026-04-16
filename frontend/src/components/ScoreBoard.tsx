/**
 * ScoreBoard — Brutalist Stats Panel
 */

import type { RoastScores } from "../types";

interface ScoreBoardProps {
  scores: RoastScores;
}

const scoreCategories: { key: keyof RoastScores; label: string }[] = [
  { key: "chaos_level", label: "CHAOS_LEVEL" },
  { key: "furniture_crime", label: "FURNITURE_CRIME" },
  { key: "lighting_sin", label: "LIGHTING_SIN" },
  { key: "overall_disaster", label: "OVERALL_DISASTER" },
];

function getVerdict(avg: number): { text: string; bg: string } {
  if (avg >= 8) return { text: "CONDEMNATION NOTICE ISSUED", bg: "bg-[#ff3b30] text-white" };
  if (avg >= 6) return { text: "DEEPLY CONCERNING", bg: "bg-[#ffcc00] text-black" };
  if (avg >= 4) return { text: "NEEDS AN INTERVENTION", bg: "bg-black text-white" };
  return { text: "SURPRISINGLY DECENT", bg: "bg-[#b2ff05] text-black" };
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  const avg =
    (scores.chaos_level + scores.furniture_crime + scores.lighting_sin + scores.overall_disaster) / 4;
  const verdict = getVerdict(avg);

  return (
    <div className="brutal-box p-6 space-y-6">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <h3 className="font-black text-xl uppercase">Damage Report</h3>
        <span className="font-mono text-xl font-bold bg-black text-white px-2 py-1">
          AVG: {avg.toFixed(1)}/10
        </span>
      </div>

      <div className="space-y-4">
        {scoreCategories.map((cat) => {
          const score = scores[cat.key];

          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between font-mono font-bold text-sm">
                <span>{cat.label}</span>
                <span>{score}/10</span>
              </div>

              <div className="h-4 border-2 border-black w-full bg-gray-100">
                <div
                  className="h-full border-r-2 border-black transition-all duration-1000"
                  style={{
                    width: `${score * 10}%`,
                    backgroundColor: score >= 8 ? "#ff3b30" : score >= 5 ? "#ffcc00" : "#b2ff05"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      <div className={`mt-6 p-4 border-4 border-black text-center font-black uppercase text-xl ${verdict.bg}`}>
        {verdict.text}
      </div>
    </div>
  );
}

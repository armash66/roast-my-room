/**
 * LeaderboardPage — Top roasts ranked by votes with premium styling.
 */

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, ThumbsUp, ThumbsDown, Flame, AlertTriangle } from "lucide-react";
import type { LeaderboardItem } from "../types";
import { getLeaderboard, voteOnRoast } from "../services/api";

export function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = useCallback(
    async (id: string, dir: "up" | "down") => {
      try {
        await voteOnRoast(id, dir);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, votes: item.votes + (dir === "up" ? 1 : -1) }
              : item
          )
        );
      } catch {}
    },
    []
  );

  const medals = ["🥇", "🥈", "🥉"];
  const podiumBorders = [
    "border-yellow-500/30",
    "border-neutral-400/30",
    "border-amber-700/30",
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-yellow-500/[0.08] border border-yellow-500/20 mb-6">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              Hall of Shame
            </span>
          </div>
          <h1
            className="text-4xl font-black text-white tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Top Roasts
          </h1>
          <p className="text-neutral-500">The most upvoted disasters of all time.</p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Flame size={28} className="text-orange-500" />
            </motion.div>
          </div>
        )}

        {error && (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-neutral-500">Connect Supabase to see the leaderboard</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-neutral-500">No roasts on the board yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`rounded-2xl p-5 bg-white/[0.03] border
                         hover:bg-white/[0.04] transition-colors duration-300
                         ${i < 3 ? podiumBorders[i] : "border-white/[0.06]"}`}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  {i < 3 ? (
                    <span className="text-xl">{medals[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-neutral-500">#{i + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-300 text-sm leading-relaxed mb-2 line-clamp-2">
                    {item.roast_text}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <span className="text-orange-400 font-semibold">💥 {item.overall_disaster}/10</span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={10} className="text-red-400" />
                      <span className="text-red-400">{item.worst_offender}</span>
                    </span>
                  </div>
                </div>

                {/* Votes */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <motion.button
                    onClick={() => handleVote(item.id, "up")}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg hover:bg-green-500/10 text-neutral-500 hover:text-green-400 transition-colors"
                  >
                    <ThumbsUp size={14} />
                  </motion.button>
                  <span className="text-sm font-bold text-white tabular-nums">{item.votes}</span>
                  <motion.button
                    onClick={() => handleVote(item.id, "down")}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <ThumbsDown size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

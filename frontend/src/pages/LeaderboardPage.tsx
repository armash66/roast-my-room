/**
 * LeaderboardPage — Top roasts ranked by votes.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import type { LeaderboardItem } from "../types";
import { getLeaderboard, voteOnRoast } from "../services/api";

export function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard();
        setItems(data);
      } catch {
        setError("Failed to load leaderboard. Supabase might not be configured.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleVote = useCallback(
    async (roastId: string, direction: 1 | -1) => {
      try {
        await voteOnRoast(roastId, direction);
        setItems((prev) =>
          prev.map((item) =>
            item.id === roastId
              ? { ...item, votes: item.votes + direction }
              : item
          )
        );
      } catch {
        // Silent fail for votes
      }
    },
    []
  );

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            <Trophy className="inline-block mr-3 text-yellow-500" size={40} />
            Hall of Shame
          </h1>
          <p className="text-neutral-400 text-lg">
            The most devastatingly accurate roasts, ranked by the people.
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-orange-500" />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center"
          >
            <p className="text-neutral-400 mb-2">{error}</p>
            <p className="text-neutral-500 text-sm">
              Set up Supabase to enable the leaderboard.
            </p>
          </motion.div>
        )}

        {!loading && !error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-center"
          >
            <p className="text-4xl mb-4">🏜️</p>
            <p className="text-neutral-400 text-lg">No roasts on the leaderboard yet.</p>
          </motion.div>
        )}

        <AnimatePresence>
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  bg-neutral-900 border rounded-2xl p-6 transition-colors
                  ${
                    index === 0
                      ? "border-yellow-500/30 shadow-lg shadow-yellow-500/5"
                      : index === 1
                        ? "border-neutral-400/30"
                        : index === 2
                          ? "border-orange-800/30"
                          : "border-neutral-800 hover:border-neutral-700"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="text-2xl font-black text-center w-12 flex-shrink-0 pt-1">
                    {getMedal(index)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-300 mb-3 leading-relaxed">{item.roast}</p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.mode === "mild"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : item.mode === "brutal"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {item.mode}
                      </span>
                      <span className="text-neutral-500">
                        ☠️ {item.scores.overall_disaster}/10
                      </span>
                      <span className="text-red-400 text-xs font-medium">
                        ⚠️ {item.worst_offender}
                      </span>
                    </div>
                  </div>

                  {/* Voting */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleVote(item.id, 1)}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-neutral-500 hover:text-green-400 transition-colors"
                      aria-label="Upvote"
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <span className="text-sm font-bold text-neutral-400 tabular-nums">
                      {item.votes}
                    </span>
                    <button
                      onClick={() => handleVote(item.id, -1)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                      aria-label="Downvote"
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

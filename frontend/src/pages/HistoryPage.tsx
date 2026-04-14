/**
 * HistoryPage — Shows past roasts.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import type { HistoryItem } from "../types";
import { getHistory } from "../services/api";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch {
        setError("Failed to load history. Supabase might not be configured.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            <Clock className="inline-block mr-3 text-orange-500" size={40} />
            Roast History
          </h1>
          <p className="text-neutral-400 text-lg">
            A shameful record of every room you've exposed.
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
              Set up Supabase and add your credentials to see roast history.
            </p>
          </motion.div>
        )}

        {!loading && !error && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-center"
          >
            <p className="text-4xl mb-4">🕳️</p>
            <p className="text-neutral-400 text-lg">No roasts yet. Go roast a room first.</p>
          </motion.div>
        )}

        <AnimatePresence>
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                      item.mode === "mild"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : item.mode === "brutal"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {item.mode}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-neutral-300 mb-3">{item.roast}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-500">
                    ☠️ {item.scores.overall_disaster}/10
                  </span>
                  <span className="text-red-400 font-medium">
                    ⚠️ {item.worst_offender}
                  </span>
                  <span className="text-neutral-500 ml-auto">
                    👍 {item.votes}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

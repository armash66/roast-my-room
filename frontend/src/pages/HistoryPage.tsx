/**
 * HistoryPage — Past roasts displayed in a premium card layout.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, AlertTriangle } from "lucide-react";
import type { HistoryItem } from "../types";
import { getHistory } from "../services/api";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const modeColors: Record<string, string> = {
    mild: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    brutal: "text-red-400 bg-red-500/10 border-red-500/20",
    unhinged: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-blue-500/[0.08] border border-blue-500/20 mb-6">
            <Clock size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Your History
            </span>
          </div>
          <h1
            className="text-4xl font-black text-white tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Past Roasts
          </h1>
          <p className="text-neutral-500">Your complete record of shame.</p>
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
            <p className="text-neutral-500">Connect Supabase to see your history</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-neutral-500">No roasts yet. Go roast a room!</p>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.06]
                         hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
                                  rounded-full border ${modeColors[item.mode] || ""}`}>
                  {item.mode}
                </span>
                <span className="text-xs text-neutral-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed mb-3">{item.roast_text}</p>
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="text-red-400 font-medium">{item.worst_offender}</span>
                </div>
                <span>💥 {item.overall_disaster}/10</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

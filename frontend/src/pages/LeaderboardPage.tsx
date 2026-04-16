/**
 * LeaderboardPage — Brutalist Hall of Shame
 */

import { useEffect, useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
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
        const val = dir === "up" ? 1 : -1;
        await voteOnRoast(id, val);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, votes: item.votes + val }
              : item
          )
        );
      } catch {}
    },
    []
  );

  return (
    <div className="min-h-screen pt-16 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-block border-2 border-black bg-[#ffcc00] px-3 py-1 mb-6 font-bold uppercase text-xs">
            PUBLIC DATABASE
          </div>
          <h1 className="text-5xl font-black title-brutal mb-2 uppercase">
            HALL OF SHAME
          </h1>
          <p className="font-mono text-xl text-gray-700">
            THE HIGHEST RATED ATROCITIES.
          </p>
        </div>

        {loading && (
          <div className="font-mono font-bold text-lg animate-pulse uppercase border-l-4 border-black pl-4">
            FETCHING DATA...
          </div>
        )}

        {error && (
          <div className="border-4 border-black p-6 bg-[#ffcc00] shadow-[8px_8px_0px_0px_#111]">
            <p className="font-bold uppercase mb-2">SUPABASE ARCHIVE OFFLINE</p>
            <p className="font-mono text-sm">DATABASE CONNECTION REQUIRED TO VIEW LEADERBOARD.</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#111]">
            <p className="font-bold uppercase">NO DATA FOUND.</p>
            <p className="font-mono text-sm text-gray-600">THE LEADERBOARD IS CURRENTLY EMPTY.</p>
          </div>
        )}

        <div className="space-y-6">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row items-stretch border-4 border-black bg-white shadow-[6px_6px_0px_0px_#111] transition-transform ${
                i === 0 ? "bg-[#ffcc00] shadow-[8px_8px_0px_0px_#ff3b30]" : i === 1 ? "bg-gray-200" : ""
              }`}
            >
              {/* Rank */}
              <div className="flex sm:flex-col items-center justify-center p-4 border-b-4 sm:border-b-0 sm:border-r-4 border-black bg-black text-white font-black text-3xl min-w-[80px]">
                #{i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <p className="text-lg font-bold leading-relaxed mb-4">{item.roast}</p>
                <div className="flex flex-wrap items-center gap-4 border-t-2 border-black pt-4 mt-4">
                  <span className="font-mono font-bold text-sm bg-black text-[#b2ff05] px-2 py-1">
                    DAMAGE: {item.scores.overall_disaster}/10
                  </span>
                  <span className="flex items-center gap-1 font-mono text-sm font-bold uppercase text-[#ff3b30]">
                    <AlertTriangle size={14} strokeWidth={3} />
                    CRITICAL: {item.worst_offender}
                  </span>
                </div>
              </div>

              {/* Votes */}
              <div className="flex sm:flex-col items-center justify-center gap-4 p-4 border-t-4 sm:border-t-0 sm:border-l-4 border-black bg-white">
                <button
                  onClick={() => handleVote(item.id, "up")}
                  className="p-2 border-2 border-black hover:bg-[#b2ff05] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <ThumbsUp size={20} strokeWidth={3} className="text-black" />
                </button>
                <span className="font-black text-2xl">{item.votes}</span>
                <button
                  onClick={() => handleVote(item.id, "down")}
                  className="p-2 border-2 border-black hover:bg-[#ff3b30] hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <ThumbsDown size={20} strokeWidth={3} className="text-black" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

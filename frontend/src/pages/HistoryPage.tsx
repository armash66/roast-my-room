/**
 * HistoryPage — Brutalist Past Roasts
 */

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
    mild: "bg-[#ffcc00] text-black",
    brutal: "bg-[#ff3b30] text-white",
    unhinged: "bg-black text-[#b2ff05]",
  };

  return (
    <div className="min-h-screen pt-16 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-block border-2 border-black bg-white px-3 py-1 mb-6 font-bold uppercase text-xs">
            DATA LOGS / ARCHIVE
          </div>
          <h1 className="text-5xl font-black title-brutal mb-2 uppercase">
            PAST ROASTS
          </h1>
          <p className="font-mono text-xl text-gray-700">
            A PERMANENT RECORD OF YOUR POOR TASTE.
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
            <p className="font-mono text-sm">DATABASE CONNECTION REQUIRED TO VIEW HISTORY.</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#111]">
            <p className="font-bold uppercase">NO DATA FOUND.</p>
            <p className="font-mono text-sm text-gray-600">INITIATE A NEW ROAST TO POPULATE THIS LOG.</p>
          </div>
        )}

        <div className="space-y-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_#111] p-6 relative"
            >
              <div className="absolute top-0 right-0 border-l-4 border-b-4 border-black px-3 py-1 font-mono font-bold text-sm bg-gray-100">
                {new Date(item.created_at).toLocaleDateString()}
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 font-bold text-xs uppercase border-2 border-black ${modeColors[item.mode] || "bg-white"}`}>
                  MODE: {item.mode}
                </span>
                <span className="ml-3 font-mono font-bold text-sm bg-black text-white px-2 py-1">
                  DAMAGE: {item.scores.overall_disaster}/10
                </span>
              </div>

              <p className="text-lg font-medium leading-relaxed mb-6">{item.roast}</p>
              
              <div className="flex items-center gap-2 border-2 border-black bg-[#ffcc00] p-3 inline-flex">
                <AlertTriangle size={18} strokeWidth={3} className="text-black" />
                <span className="font-bold text-sm uppercase">WORST OFFENDER:</span>
                <span className="font-mono text-sm bg-white border border-black px-2 py-0.5 font-bold">
                  {item.worst_offender}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * BattlePage — Brutalist Room vs Room
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, RotateCcw } from "lucide-react";
import type { RoastMode, BattleResult } from "../types";
import { createBattle } from "../services/api";
import { ImageUploader } from "../components/ImageUploader";
import { ModeSelector } from "../components/ModeSelector";
import { ScoreBoard } from "../components/ScoreBoard";

export function BattlePage() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [mode, setMode] = useState<RoastMode>("brutal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBattle = useCallback(async () => {
    if (!image1 || !image2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createBattle(image1, image2, mode);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Battle failed");
    } finally {
      setLoading(false);
    }
  }, [image1, image2, mode]);

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pt-16 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-block border-2 border-black bg-[#ff3b30] text-white px-3 py-1 mb-6 font-bold uppercase text-xs">
            DEATHMATCH MODE INITIATED
          </div>
          <h1 className="text-5xl sm:text-7xl font-black title-brutal mb-4 uppercase">
            ROOM VS ROOM
          </h1>
          <p className="text-xl font-mono text-gray-700 mt-4">
            TWO ROOMS ENTER. ONLY ONE SURVIVES THE CRITIQUE.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="setup" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#111]">
                  <ImageUploader onImageSelect={setImage1} disabled={loading} />
                </div>
                <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#111]">
                  <ImageUploader onImageSelect={setImage2} disabled={loading} />
                </div>
              </div>

              <ModeSelector selected={mode} onChange={setMode} disabled={loading} />

              <button
                onClick={handleBattle}
                disabled={!image1 || !image2 || loading}
                className={`brutal-btn w-full flex items-center justify-center gap-3 text-2xl py-6 ${
                  image1 && image2 ? "brutal-btn-danger" : ""
                }`}
              >
                <Swords size={32} />
                {loading ? "EXECUTING BATTLE PROTOCOL..." : "START BATTLE"}
              </button>

              {error && (
                <div className="p-4 border-4 border-black bg-red-100 text-red-600 font-mono font-bold uppercase">
                  ERROR: {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" className="space-y-12">
              <div className="text-center p-8 border-4 border-black bg-[#ff3b30] text-white shadow-[8px_8px_0px_0px_#111]">
                <h2 className="text-4xl font-black uppercase mb-4 title-brutal">
                  TARGET {result.winner} IS THE BIGGER DISASTER
                </h2>
                <p className="font-mono text-lg max-w-2xl mx-auto bg-black p-4 border-2 border-white">
                  {result.reasoning}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[result.room1_roast, result.room2_roast].map((roast, i) => (
                  <div
                    key={i}
                    className={`p-6 border-4 border-black bg-white ${
                      result.winner === i + 1 ? "shadow-[8px_8px_0px_0px_#ff3b30]" : "shadow-[8px_8px_0px_0px_#111]"
                    }`}
                  >
                    <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                      <h3 className="text-2xl font-black uppercase">ROOM {i + 1}</h3>
                      {result.winner === i + 1 && (
                        <span className="bg-[#ff3b30] text-white px-2 py-1 font-bold text-sm">
                          LOSER
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-medium leading-relaxed mb-8">{roast.roast}</p>
                    <ScoreBoard scores={roast.scores} />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <button onClick={handleReset} className="brutal-btn flex items-center gap-2">
                  <RotateCcw size={20} />
                  ENGAGE NEW TARGETS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

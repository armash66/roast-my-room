/**
 * BattlePage — Room vs Room battle mode with premium layout.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, RotateCcw, Flame } from "lucide-react";
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
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-purple-500/[0.08] border border-purple-500/20 mb-6"
          >
            <Swords size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Battle Mode
            </span>
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Room vs Room
          </h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            Two rooms enter. One gets crowned the bigger disaster.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Two uploaders side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader
                  onImageSelect={setImage1}
                  disabled={loading}
                  label="Room 1"
                />
                <ImageUploader
                  onImageSelect={setImage2}
                  disabled={loading}
                  label="Room 2"
                />
              </div>

              <ModeSelector selected={mode} onChange={setMode} disabled={loading} />

              <motion.button
                onClick={handleBattle}
                disabled={!image1 || !image2 || loading}
                whileHover={image1 && image2 ? { scale: 1.02 } : {}}
                whileTap={image1 && image2 ? { scale: 0.98 } : {}}
                className={`
                  w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3
                  transition-all duration-500
                  ${
                    image1 && image2
                      ? "btn-primary text-white shadow-[0_0_40px_rgba(249,115,22,0.2)]"
                      : "bg-white/[0.04] text-neutral-600 border border-white/[0.06] cursor-not-allowed"
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Swords size={20} />
                  {loading ? "Battling..." : "Start Battle"}
                </span>
              </motion.button>

              {error && (
                <p className="text-center text-red-400 text-sm">{error}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Winner banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-500/[0.08] to-red-500/[0.05]
                           border border-orange-500/20"
              >
                <Trophy size={40} className="text-orange-400 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white mb-2">
                  Room {result.winner} is the Bigger Disaster
                </h2>
                <p className="text-neutral-400 text-sm max-w-md mx-auto">{result.reasoning}</p>
              </motion.div>

              {/* Both roasts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[result.room1_roast, result.room2_roast].map((roast, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className={`rounded-2xl p-5 bg-white/[0.03] border relative
                      ${result.winner === i + 1 ? "border-orange-500/30" : "border-white/[0.06]"}`}
                  >
                    {result.winner === i + 1 && (
                      <div className="absolute -top-3 -right-3 bg-orange-500 rounded-full p-1.5">
                        <Flame size={14} className="text-white" />
                      </div>
                    )}
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Room {i + 1}
                    </h3>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">{roast.roast}</p>
                    <ScoreBoard scores={roast.scores} />
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl
                             bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]
                             text-neutral-400 font-medium text-sm transition-colors"
                >
                  <RotateCcw size={16} />
                  Battle Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

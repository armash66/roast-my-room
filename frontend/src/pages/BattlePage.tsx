/**
 * BattlePage — Room vs Room battle mode.
 * Upload two room images and see which one is worse.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2 } from "lucide-react";
import type { RoastMode, BattleResult } from "../types";
import { createBattle, ApiError } from "../services/api";
import { ImageUploader } from "../components/ImageUploader";
import { ModeSelector } from "../components/ModeSelector";
import { RoastDisplay } from "../components/RoastDisplay";
import { ScoreBoard } from "../components/ScoreBoard";

export function BattlePage() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [mode, setMode] = useState<RoastMode>("brutal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startBattle = useCallback(async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const battleResult = await createBattle(image1, image2, mode);
      setResult(battleResult);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Battle failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [image1, image2, mode]);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            ⚔️ Room <span className="text-orange-500">Battle</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Two rooms enter. One gets destroyed more than the other.
          </p>
        </motion.div>

        {/* Upload zones */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
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
              onClick={startBattle}
              disabled={!image1 || !image2 || loading}
              whileHover={image1 && image2 ? { scale: 1.02 } : {}}
              whileTap={image1 && image2 ? { scale: 0.98 } : {}}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
                flex items-center justify-center gap-3
                ${
                  image1 && image2
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/25 cursor-pointer"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Battling...
                </>
              ) : (
                <>
                  <Swords size={22} />
                  Start Battle
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 bg-red-950/30 border border-red-900/50 rounded-2xl text-center"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-8"
            >
              {/* Winner banner */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="text-center p-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl"
              >
                <p className="text-5xl mb-3">
                  {result.winner === 1 ? "🏆" : "🏆"}
                </p>
                <h2 className="text-2xl font-black text-white mb-2">
                  Room {result.winner} "Wins" (Loses Worse)
                </h2>
                <p className="text-neutral-400">{result.reasoning}</p>
              </motion.div>

              {/* Room roasts side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { roast: result.room1_roast, label: "Room 1", isWinner: result.winner === 1 },
                  { roast: result.room2_roast, label: "Room 2", isWinner: result.winner === 2 },
                ].map(({ roast, label, isWinner }) => (
                  <div
                    key={label}
                    className={`space-y-4 p-4 rounded-2xl border ${
                      isWinner ? "border-red-500/30 bg-red-950/10" : "border-neutral-800"
                    }`}
                  >
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {label}
                      {isWinner && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                          WORSE
                        </span>
                      )}
                    </h3>
                    <RoastDisplay
                      text={roast.roast}
                      worstOffender={roast.worst_offender}
                      isStreaming={false}
                    />
                    <ScoreBoard scores={roast.scores} />
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setImage1(null);
                    setImage2(null);
                  }}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 font-medium transition-colors"
                >
                  Battle Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

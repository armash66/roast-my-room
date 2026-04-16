/**
 * HomePage — Premium main roast page with dramatic hero and sections.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, RotateCcw, ArrowRight } from "lucide-react";
import type { RoastMode } from "../types";
import { useRoast } from "../hooks/useRoast";
import { ImageUploader } from "../components/ImageUploader";
import { ModeSelector } from "../components/ModeSelector";
import { LoadingState } from "../components/LoadingState";
import { RoastDisplay } from "../components/RoastDisplay";
import { ScoreBoard } from "../components/ScoreBoard";
import { ShareCard } from "../components/ShareCard";

export function HomePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [mode, setMode] = useState<RoastMode>("brutal");

  const {
    stage,
    statusMessage,
    roastText,
    scores,
    worstOffender,
    error,
    isLoading,
    startRoast,
    reset,
  } = useRoast();

  const handleSubmit = useCallback(() => {
    if (!selectedImage) return;
    startRoast(selectedImage, mode);
  }, [selectedImage, mode, startRoast]);

  const handleReset = useCallback(() => {
    reset();
    setSelectedImage(null);
  }, [reset]);

  const showResults = stage === "roasting" || stage === "scoring" || stage === "complete";

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Hero ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-orange-500/[0.08] border border-orange-500/20 mb-6"
          >
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              AI-Powered Room Critique
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.95] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <span className="text-white">Your room.</span>
            <br />
            <span className="text-gradient">Brutally roasted.</span>
          </motion.h1>

          <motion.p
            className="text-neutral-500 text-lg max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Upload a photo. Pick your intensity. Watch the AI tear your interior design apart.
          </motion.p>
        </motion.div>

        {/* ── Upload + Controls ────────────── */}
        <AnimatePresence mode="wait">
          {stage === "idle" || stage === "uploading" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <ImageUploader onImageSelect={setSelectedImage} disabled={isLoading} />

              <ModeSelector selected={mode} onChange={setMode} disabled={isLoading} />

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={!selectedImage || isLoading}
                whileHover={selectedImage ? { scale: 1.02 } : {}}
                whileTap={selectedImage ? { scale: 0.98 } : {}}
                className={`
                  w-full py-4 rounded-xl font-bold text-base
                  flex items-center justify-center gap-3
                  transition-all duration-500 relative overflow-hidden
                  ${
                    selectedImage
                      ? "btn-primary text-white shadow-[0_0_40px_rgba(249,115,22,0.2)]"
                      : "bg-white/[0.04] text-neutral-600 border border-white/[0.06] cursor-not-allowed"
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Flame size={20} />
                  {isLoading ? "Roasting..." : "Roast My Room"}
                  {selectedImage && !isLoading && <ArrowRight size={18} />}
                </span>
              </motion.button>
            </motion.div>
          ) : isLoading && !showResults ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState statusMessage={statusMessage} stage={stage} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Error ───────────────────────── */}
        <AnimatePresence>
          {stage === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 p-6 rounded-2xl bg-red-500/[0.06] border border-red-500/[0.12] text-center"
            >
              <p className="text-red-400 font-medium mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30
                          border border-red-500/20 text-red-300 font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ─────────────────────── */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 space-y-6"
            >
              <RoastDisplay
                text={roastText}
                worstOffender={worstOffender}
                isStreaming={stage === "roasting"}
              />

              {scores && <ScoreBoard scores={scores} />}

              {stage === "complete" && scores && (
                <>
                  <ShareCard
                    roast={roastText}
                    scores={scores}
                    worstOffender={worstOffender}
                    mode={mode}
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center pt-2"
                  >
                    <motion.button
                      onClick={handleReset}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl
                                 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]
                                 text-neutral-400 font-medium text-sm transition-colors"
                    >
                      <RotateCcw size={16} />
                      Roast Another Room
                    </motion.button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

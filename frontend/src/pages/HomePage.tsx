/**
 * HomePage — Main roast page. Upload, select mode, get roasted.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, RotateCcw } from "lucide-react";
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
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.h1
            className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            🔥 Roast<span className="text-orange-500">My</span>Room
          </motion.h1>
          <motion.p
            className="text-neutral-400 text-lg max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Upload a photo of your room. Get brutally honest interior design critiques powered by AI.
          </motion.p>
        </motion.div>

        {/* Upload + Controls */}
        <AnimatePresence mode="wait">
          {stage === "idle" || stage === "uploading" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <ImageUploader
                onImageSelect={setSelectedImage}
                disabled={isLoading}
              />

              <ModeSelector
                selected={mode}
                onChange={setMode}
                disabled={isLoading}
              />

              {/* Submit button */}
              <motion.button
                onClick={handleSubmit}
                disabled={!selectedImage || isLoading}
                whileHover={selectedImage ? { scale: 1.02 } : {}}
                whileTap={selectedImage ? { scale: 0.98 } : {}}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
                  flex items-center justify-center gap-3
                  ${
                    selectedImage
                      ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-600/25 cursor-pointer"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }
                `}
              >
                <Flame size={22} />
                {isLoading ? "Roasting..." : "Roast My Room"}
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

        {/* Error */}
        <AnimatePresence>
          {stage === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-6 bg-red-950/30 border border-red-900/50 rounded-2xl text-center"
            >
              <p className="text-red-400 font-medium mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <RoastDisplay
                text={roastText}
                worstOffender={worstOffender}
                isStreaming={stage === "roasting"}
              />

              {scores && (
                <ScoreBoard scores={scores} />
              )}

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
                    className="flex justify-center pt-4"
                  >
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 
                                 rounded-xl text-neutral-300 font-medium transition-colors"
                    >
                      <RotateCcw size={16} />
                      Roast Another Room
                    </button>
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

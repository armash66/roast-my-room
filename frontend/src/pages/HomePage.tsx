/**
 * HomePage — Neo-Brutalist Main Page
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
    <div className="min-h-screen pt-16 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* ── Hero ─────────────────────────── */}
        <div className="mb-12">
          <div className="inline-block border-2 border-black bg-white px-3 py-1 mb-6 font-bold uppercase text-xs">
            System Online / AI Critique Engine v2.0
          </div>
          <h1 className="text-5xl sm:text-7xl font-black title-brutal mb-4">
            YOUR ROOM.
            <br />
            <span className="bg-black text-[#b2ff05] px-2 py-1 inline-block mt-2">DESTROYED.</span>
          </h1>
          <p className="text-xl font-mono text-gray-700 mt-6 max-w-md">
            Upload photo. Choose mode. Receive devastating structural and aesthetic analysis.
          </p>
        </div>

        {/* ── Upload + Controls ────────────── */}
        <AnimatePresence mode="wait">
          {stage === "idle" || stage === "uploading" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <ImageUploader onImageSelect={setSelectedImage} disabled={isLoading} />
              <ModeSelector selected={mode} onChange={setMode} disabled={isLoading} />

              <button
                onClick={handleSubmit}
                disabled={!selectedImage || isLoading}
                className={`brutal-btn w-full flex items-center justify-center gap-3 text-lg py-5 ${
                  selectedImage ? "brutal-btn-primary" : ""
                }`}
              >
                <Flame size={24} />
                {isLoading ? "EXECUTING ROAST..." : "INITIATE ROAST"}
                {selectedImage && !isLoading && <ArrowRight size={24} />}
              </button>
            </motion.div>
          ) : isLoading && !showResults ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState statusMessage={statusMessage} stage={stage} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Error ───────────────────────── */}
        {stage === "error" && error && (
          <div className="mt-8 brutal-box border-red-500 bg-red-50 p-6 text-red-600">
            <h3 className="font-bold text-lg mb-2">SYSTEM FAILURE</h3>
            <p className="font-mono mb-4">{error}</p>
            <button onClick={handleReset} className="brutal-btn brutal-btn-danger text-sm py-2">
              RETRY SEQUENCE
            </button>
          </div>
        )}

        {/* ── Results ─────────────────────── */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              <RoastDisplay text={roastText} worstOffender={worstOffender} isStreaming={stage === "roasting"} />
              {scores && <ScoreBoard scores={scores} />}

              {stage === "complete" && scores && (
                <>
                  <ShareCard roast={roastText} scores={scores} worstOffender={worstOffender} mode={mode} />
                  <div className="flex justify-center pt-8">
                    <button onClick={handleReset} className="brutal-btn flex items-center gap-2">
                      <RotateCcw size={18} />
                      NEW TARGET
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * useRoast — Custom hook for managing the roast pipeline state.
 * Handles streaming, stage transitions, and error recovery.
 */

import { useState, useCallback, useRef } from "react";
import type { RoastMode, RoastState, StreamChunk, RoastScores, VisionAnalysis } from "../types";
import { createRoastStream, ApiError } from "../services/api";

const INITIAL_STATE: RoastState = {
  stage: "idle",
  statusMessage: "",
  roastText: "",
  scores: null,
  worstOffender: "",
  analysis: null,
  error: null,
};

export function useRoast() {
  const [state, setState] = useState<RoastState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const updateState = useCallback((partial: Partial<RoastState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const startRoast = useCallback(
    async (image: File, mode: RoastMode) => {
      // Cancel any in-progress request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Reset state
      setState({
        ...INITIAL_STATE,
        stage: "uploading",
        statusMessage: "uploading your room...",
      });

      try {
        await createRoastStream(
          image,
          mode,
          (chunk: StreamChunk) => {
            switch (chunk.type) {
              case "status":
                updateState({
                  stage: "analyzing",
                  statusMessage: chunk.data as string,
                });
                break;

              case "analysis":
                updateState({
                  stage: "analyzing",
                  analysis: chunk.data as unknown as VisionAnalysis,
                  statusMessage: "room analyzed, generating roast...",
                });
                break;

              case "roast_start":
                updateState({
                  stage: "roasting",
                  roastText: "",
                  statusMessage: "",
                });
                break;

              case "roast_char":
                setState((prev) => ({
                  ...prev,
                  stage: "roasting",
                  roastText: prev.roastText + (chunk.data as string),
                }));
                break;

              case "scores":
                updateState({
                  stage: "scoring",
                  scores: chunk.data as unknown as RoastScores,
                });
                break;

              case "worst_offender":
                updateState({
                  worstOffender: chunk.data as string,
                });
                break;

              case "done":
                updateState({
                  stage: "complete",
                });
                break;

              case "error":
                updateState({
                  stage: "error",
                  error: chunk.data as string,
                });
                break;
            }
          },
          controller.signal
        );
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 429) {
            updateState({
              stage: "error",
              error: `Slow down! ${err.message}`,
            });
          } else {
            updateState({
              stage: "error",
              error: err.message,
            });
          }
        } else if ((err as Error).name !== "AbortError") {
          updateState({
            stage: "error",
            error: "Something went wrong. Try again.",
          });
        }
      }
    },
    [updateState]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    startRoast,
    reset,
    isLoading:
      state.stage === "uploading" ||
      state.stage === "analyzing" ||
      state.stage === "roasting" ||
      state.stage === "scoring",
  };
}

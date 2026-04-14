/**
 * TypeScript type definitions for RoastMyRoom.
 * Mirrors the backend Pydantic models exactly.
 */

// ─── Enums ────────────────────────────────────────────

export type RoastMode = "mild" | "brutal" | "unhinged";

// ─── Core Types ───────────────────────────────────────

export interface RoastScores {
  chaos_level: number;
  furniture_crime: number;
  lighting_sin: number;
  overall_disaster: number;
}

export interface RoastResult {
  roast: string;
  scores: RoastScores;
  worst_offender: string;
}

export interface RoastResponse {
  id?: string;
  roast: string;
  scores: RoastScores;
  worst_offender: string;
  mode: RoastMode;
  image_url?: string;
  created_at?: string;
}

export interface VisionAnalysis {
  objects: string[];
  layout: string;
  lighting: string;
  colors: string[];
  cleanliness: string;
  notable_details: string[];
}

// ─── Battle Types ─────────────────────────────────────

export interface BattleResult {
  room1_roast: RoastResult;
  room2_roast: RoastResult;
  winner: 1 | 2;
  reasoning: string;
}

// ─── History & Leaderboard ────────────────────────────

export interface HistoryItem {
  id: string;
  roast: string;
  scores: RoastScores;
  worst_offender: string;
  mode: RoastMode;
  image_url?: string;
  created_at: string;
  votes: number;
}

export interface LeaderboardItem {
  id: string;
  roast: string;
  scores: RoastScores;
  worst_offender: string;
  mode: RoastMode;
  image_url?: string;
  votes: number;
  username?: string;
}

// ─── Streaming Types ──────────────────────────────────

export interface StreamChunk {
  type:
    | "status"
    | "analysis"
    | "roast_start"
    | "roast_char"
    | "scores"
    | "worst_offender"
    | "done"
    | "error";
  data: string | Record<string, unknown>;
}

// ─── UI State Types ───────────────────────────────────

export type RoastStage =
  | "idle"
  | "uploading"
  | "analyzing"
  | "roasting"
  | "scoring"
  | "complete"
  | "error";

export interface RoastState {
  stage: RoastStage;
  statusMessage: string;
  roastText: string;
  scores: RoastScores | null;
  worstOffender: string;
  analysis: VisionAnalysis | null;
  error: string | null;
}

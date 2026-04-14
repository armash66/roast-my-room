-- RoastMyRoom — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- ─── Roasts Table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS roasts (
  id TEXT PRIMARY KEY,
  roast_text TEXT NOT NULL,
  chaos_level INTEGER NOT NULL CHECK (chaos_level BETWEEN 1 AND 10),
  furniture_crime INTEGER NOT NULL CHECK (furniture_crime BETWEEN 1 AND 10),
  lighting_sin INTEGER NOT NULL CHECK (lighting_sin BETWEEN 1 AND 10),
  overall_disaster INTEGER NOT NULL CHECK (overall_disaster BETWEEN 1 AND 10),
  worst_offender TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('mild', 'brutal', 'unhinged')),
  image_url TEXT DEFAULT '',
  user_id TEXT DEFAULT 'anonymous',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_roasts_user_id ON roasts (user_id);
CREATE INDEX IF NOT EXISTS idx_roasts_votes ON roasts (votes DESC);
CREATE INDEX IF NOT EXISTS idx_roasts_created_at ON roasts (created_at DESC);

-- ─── Storage Bucket ─────────────────────────────────────
-- Create this in Supabase Dashboard > Storage:
-- Bucket name: roast-images
-- Public: Yes

-- ─── Row Level Security (RLS) ───────────────────────────

ALTER TABLE roasts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read roasts (for leaderboard)
CREATE POLICY "Anyone can read roasts" ON roasts
  FOR SELECT USING (true);

-- Allow anyone to insert roasts (anonymous usage)
CREATE POLICY "Anyone can insert roasts" ON roasts
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update votes
CREATE POLICY "Anyone can update votes" ON roasts
  FOR UPDATE USING (true);

/**
 * API service layer — clean abstraction over all backend endpoints.
 * Handles streaming, error normalization, and request formatting.
 */

import type {
  RoastMode,
  RoastResponse,
  BattleResult,
  HistoryItem,
  LeaderboardItem,
  StreamChunk,
} from "../types";

const API_BASE = "/api";

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Helpers ──────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    let message: string;
    try {
      const data = await response.json();
      message = data.detail || `Request failed with status ${response.status}`;
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new ApiError(
      response.status,
      message,
      retryAfter ? parseInt(retryAfter) : undefined
    );
  }
  return response.json();
}

// ─── Roast API ────────────────────────────────────────

export async function createRoastStream(
  image: File,
  mode: RoastMode,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("mode", mode);

  const response = await fetch(`${API_BASE}/roast`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    let message: string;
    try {
      const data = await response.json();
      message = data.detail || "Request failed";
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new ApiError(
      response.status,
      message,
      retryAfter ? parseInt(retryAfter) : undefined
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          const chunk: StreamChunk = JSON.parse(trimmed.slice(6));
          onChunk(chunk);
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }
}

export async function createRoastSync(
  image: File,
  mode: RoastMode
): Promise<RoastResponse> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("mode", mode);

  const response = await fetch(`${API_BASE}/roast/sync`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<RoastResponse>(response);
}

// ─── Battle API ───────────────────────────────────────

export async function createBattle(
  image1: File,
  image2: File,
  mode: RoastMode
): Promise<BattleResult> {
  const formData = new FormData();
  formData.append("image1", image1);
  formData.append("image2", image2);
  formData.append("mode", mode);

  const response = await fetch(`${API_BASE}/battle`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<BattleResult>(response);
}

// ─── History API ──────────────────────────────────────

export async function getHistory(
  userId: string = "anonymous",
  limit: number = 20
): Promise<HistoryItem[]> {
  const params = new URLSearchParams({ user_id: userId, limit: limit.toString() });
  const response = await fetch(`${API_BASE}/history?${params}`);
  return handleResponse<HistoryItem[]>(response);
}

// ─── Leaderboard API ─────────────────────────────────

export async function getLeaderboard(
  limit: number = 20
): Promise<LeaderboardItem[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  const response = await fetch(`${API_BASE}/leaderboard?${params}`);
  return handleResponse<LeaderboardItem[]>(response);
}

// ─── Vote API ─────────────────────────────────────────

export async function voteOnRoast(
  roastId: string,
  direction: 1 | -1
): Promise<void> {
  const response = await fetch(`${API_BASE}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roast_id: roastId, direction }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Vote failed");
  }
}

export { ApiError };

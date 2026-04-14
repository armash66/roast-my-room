"""
Pydantic models for request/response validation.
Strict typing for the entire API surface.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum
from datetime import datetime


# ─── Enums ────────────────────────────────────────────────

class RoastMode(str, Enum):
    """Available roast intensity modes."""
    MILD = "mild"
    BRUTAL = "brutal"
    UNHINGED = "unhinged"


# ─── Stage 1: Vision Analysis ────────────────────────────

class VisionAnalysis(BaseModel):
    """Structured output from Stage 1 vision analysis."""
    objects: list[str] = Field(..., min_length=1, description="List of visible items in the room")
    layout: str = Field(..., min_length=5, description="Description of room layout")
    lighting: str = Field(..., min_length=5, description="Description of lighting conditions")
    colors: list[str] = Field(..., min_length=1, description="List of dominant colors")
    cleanliness: str = Field(..., min_length=5, description="Description of cleanliness level")
    notable_details: list[str] = Field(..., description="Specific notable observations")


# ─── Stage 2: Roast Output ───────────────────────────────

class RoastScores(BaseModel):
    """Scoring metrics for a room roast."""
    chaos_level: int = Field(..., ge=1, le=10, description="Overall chaos score")
    furniture_crime: int = Field(..., ge=1, le=10, description="How bad is the furniture")
    lighting_sin: int = Field(..., ge=1, le=10, description="How bad is the lighting")
    overall_disaster: int = Field(..., ge=1, le=10, description="Overall disaster rating")


class RoastResult(BaseModel):
    """Complete roast output — the non-negotiable output contract."""
    roast: str = Field(..., min_length=20, description="The roast text")
    scores: RoastScores
    worst_offender: str = Field(..., min_length=3, description="Single worst item in the room")


# ─── API Request/Response ────────────────────────────────

class RoastRequest(BaseModel):
    """Request body for the /roast endpoint."""
    mode: RoastMode = Field(default=RoastMode.BRUTAL, description="Roast intensity mode")


class RoastResponse(BaseModel):
    """Full response for the /roast endpoint."""
    id: Optional[str] = None
    roast: str
    scores: RoastScores
    worst_offender: str
    mode: RoastMode
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None


class BattleRequest(BaseModel):
    """Request body for the /battle endpoint (images sent as form data)."""
    mode: RoastMode = Field(default=RoastMode.BRUTAL)


class BattleResult(BaseModel):
    """Result of a room battle."""
    room1_roast: RoastResult
    room2_roast: RoastResult
    winner: int = Field(..., ge=1, le=2, description="Which room wins (1 or 2)")
    reasoning: str = Field(..., min_length=10, description="Why this room won")


class HistoryItem(BaseModel):
    """A single item from roast history."""
    id: str
    roast: str
    scores: RoastScores
    worst_offender: str
    mode: RoastMode
    image_url: Optional[str] = None
    created_at: datetime
    votes: int = 0


class LeaderboardItem(BaseModel):
    """A leaderboard entry."""
    id: str
    roast: str
    scores: RoastScores
    worst_offender: str
    mode: RoastMode
    image_url: Optional[str] = None
    votes: int = 0
    username: Optional[str] = None


class VoteRequest(BaseModel):
    """Request body for voting on a roast."""
    roast_id: str
    direction: int = Field(..., ge=-1, le=1, description="-1 for downvote, 1 for upvote")

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, v: int) -> int:
        if v not in (-1, 1):
            raise ValueError("Direction must be -1 or 1")
        return v


class StreamChunk(BaseModel):
    """A single chunk in the streaming response."""
    type: str = Field(..., description="Type: 'analysis', 'roast', 'scores', 'error', 'done'")
    data: Optional[dict | str] = None

"""
Supabase service for database operations and storage.
Handles roast history, leaderboard, and image storage.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from supabase import acreate_client, AsyncClient

from app.config import get_settings
from app.models.schemas import (
    RoastResult,
    RoastMode,
    HistoryItem,
    LeaderboardItem,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class SupabaseService:
    """Async Supabase client for database + storage operations."""

    def __init__(self):
        self._client: Optional[AsyncClient] = None

    async def get_client(self) -> AsyncClient:
        """Lazy-initialize the async Supabase client."""
        if self._client is None:
            if not settings.supabase_url or not settings.supabase_anon_key:
                raise RuntimeError("Supabase credentials not configured")
            self._client = await acreate_client(
                settings.supabase_url,
                settings.supabase_anon_key,
            )
        return self._client

    # ─── Image Storage ───────────────────────────────────

    async def upload_image(self, image_data: bytes, content_type: str) -> str:
        """Upload image to Supabase Storage and return public URL."""
        try:
            client = await self.get_client()
            ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
            filename = f"rooms/{uuid.uuid4().hex}.{ext}"

            await client.storage.from_("roast-images").upload(
                filename,
                image_data,
                file_options={"content-type": content_type},
            )

            url = client.storage.from_("roast-images").get_public_url(filename)
            logger.info(f"Image uploaded: {filename}")
            return url
        except Exception as e:
            logger.error(f"Image upload failed: {e}")
            return ""

    # ─── Roast History ───────────────────────────────────

    async def save_roast(
        self,
        roast: RoastResult,
        mode: RoastMode,
        image_url: str = "",
        user_id: str = "anonymous",
    ) -> str:
        """Save a roast to the database. Returns the roast ID."""
        try:
            client = await self.get_client()
            roast_id = uuid.uuid4().hex

            data = {
                "id": roast_id,
                "roast_text": roast.roast,
                "chaos_level": roast.scores.chaos_level,
                "furniture_crime": roast.scores.furniture_crime,
                "lighting_sin": roast.scores.lighting_sin,
                "overall_disaster": roast.scores.overall_disaster,
                "worst_offender": roast.worst_offender,
                "mode": mode.value,
                "image_url": image_url,
                "user_id": user_id,
                "votes": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            await client.table("roasts").insert(data).execute()
            logger.info(f"Roast saved: {roast_id}")
            return roast_id

        except Exception as e:
            logger.error(f"Failed to save roast: {e}")
            return ""

    async def get_history(
        self, user_id: str = "anonymous", limit: int = 20
    ) -> list[HistoryItem]:
        """Get roast history for a user."""
        try:
            client = await self.get_client()
            response = (
                await client.table("roasts")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )

            items = []
            for row in response.data:
                items.append(
                    HistoryItem(
                        id=row["id"],
                        roast=row["roast_text"],
                        scores={
                            "chaos_level": row["chaos_level"],
                            "furniture_crime": row["furniture_crime"],
                            "lighting_sin": row["lighting_sin"],
                            "overall_disaster": row["overall_disaster"],
                        },
                        worst_offender=row["worst_offender"],
                        mode=row["mode"],
                        image_url=row.get("image_url"),
                        created_at=row["created_at"],
                        votes=row.get("votes", 0),
                    )
                )
            return items

        except Exception as e:
            logger.error(f"Failed to get history: {e}")
            return []

    # ─── Leaderboard ─────────────────────────────────────

    async def get_leaderboard(self, limit: int = 20) -> list[LeaderboardItem]:
        """Get top roasts by votes."""
        try:
            client = await self.get_client()
            response = (
                await client.table("roasts")
                .select("*")
                .order("votes", desc=True)
                .limit(limit)
                .execute()
            )

            items = []
            for row in response.data:
                items.append(
                    LeaderboardItem(
                        id=row["id"],
                        roast=row["roast_text"],
                        scores={
                            "chaos_level": row["chaos_level"],
                            "furniture_crime": row["furniture_crime"],
                            "lighting_sin": row["lighting_sin"],
                            "overall_disaster": row["overall_disaster"],
                        },
                        worst_offender=row["worst_offender"],
                        mode=row["mode"],
                        image_url=row.get("image_url"),
                        votes=row.get("votes", 0),
                        username=row.get("user_id", "anonymous"),
                    )
                )
            return items

        except Exception as e:
            logger.error(f"Failed to get leaderboard: {e}")
            return []

    async def vote(self, roast_id: str, direction: int) -> bool:
        """Vote on a roast. direction: 1 for upvote, -1 for downvote."""
        try:
            client = await self.get_client()
            # Get current votes
            response = (
                await client.table("roasts")
                .select("votes")
                .eq("id", roast_id)
                .single()
                .execute()
            )
            current_votes = response.data.get("votes", 0)

            # Update
            await (
                client.table("roasts")
                .update({"votes": current_votes + direction})
                .eq("id", roast_id)
                .execute()
            )
            return True

        except Exception as e:
            logger.error(f"Failed to vote: {e}")
            return False


# Singleton
supabase_service = SupabaseService()

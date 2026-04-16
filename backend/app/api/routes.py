"""
API route handlers for the RoastMyRoom backend.
All endpoints are fully async with proper error handling.
"""

import json
import logging
from typing import Optional

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.models.schemas import (
    RoastMode,
    RoastResponse,
    BattleResult,
    HistoryItem,
    LeaderboardItem,
    VoteRequest,
)
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.middleware.rate_limit import rate_limiter
from app.utils.image import validate_image, compress_image

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ─── POST /roast ─────────────────────────────────────────

@router.post("/roast")
async def create_roast(
    request: Request,
    image: UploadFile = File(...),
    mode: str = Form(default="brutal"),
):
    """
    Upload a room image and receive a streaming roast.
    Returns Server-Sent Events for real-time frontend updates.
    """
    client_ip = _get_client_ip(request)

    # Rate limit check
    allowed, remaining, reset_time = await rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {reset_time} seconds.",
            headers={"Retry-After": str(reset_time)},
        )

    # Validate mode
    try:
        roast_mode = RoastMode(mode)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode: {mode}. Must be one of: mild, brutal, unhinged",
        )

    # Validate image
    content_type = image.content_type or "image/jpeg"
    image_data = await image.read()
    is_valid, error = validate_image(content_type, len(image_data))
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Compress image
    compressed_data, media_type = compress_image(image_data)

    # Stream the response
    async def event_stream():
        try:
            async for chunk in gemini_service.run_pipeline_streaming(
                compressed_data, media_type, roast_mode
            ):
                yield f"data: {json.dumps(chunk)}\n\n"

            # Try to save to Supabase (non-blocking, don't fail the request)
            try:
                image_url = await supabase_service.upload_image(
                    compressed_data, media_type
                )
            except Exception:
                image_url = ""

        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-RateLimit-Remaining": str(remaining),
        },
    )


# ─── POST /roast/sync ───────────────────────────────────

@router.post("/roast/sync", response_model=RoastResponse)
async def create_roast_sync(
    request: Request,
    image: UploadFile = File(...),
    mode: str = Form(default="brutal"),
):
    """
    Non-streaming version of the roast endpoint.
    Returns the complete result at once.
    """
    client_ip = _get_client_ip(request)

    # Rate limit
    allowed, remaining, reset_time = await rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {reset_time} seconds.",
        )

    try:
        roast_mode = RoastMode(mode)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")

    content_type = image.content_type or "image/jpeg"
    image_data = await image.read()
    is_valid, error = validate_image(content_type, len(image_data))
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    compressed_data, media_type = compress_image(image_data)

    try:
        analysis, roast = await gemini_service.run_pipeline(
            compressed_data, media_type, roast_mode
        )
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail="Roast generation failed. Try again.")

    # Save to Supabase
    image_url = ""
    roast_id = ""
    try:
        image_url = await supabase_service.upload_image(compressed_data, media_type)
        roast_id = await supabase_service.save_roast(roast, roast_mode, image_url)
    except Exception as e:
        logger.warning(f"Supabase save failed (non-critical): {e}")

    return RoastResponse(
        id=roast_id or None,
        roast=roast.roast,
        scores=roast.scores,
        worst_offender=roast.worst_offender,
        mode=roast_mode,
        image_url=image_url or None,
    )


# ─── POST /battle ────────────────────────────────────────

@router.post("/battle", response_model=BattleResult)
async def create_battle(
    request: Request,
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    mode: str = Form(default="brutal"),
):
    """
    Battle two rooms. Returns roasts for both + winner.
    """
    client_ip = _get_client_ip(request)
    allowed, _, reset_time = await rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Try again in {reset_time}s.")

    try:
        roast_mode = RoastMode(mode)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")

    # Validate both images
    for idx, img in enumerate([image1, image2], 1):
        content_type = img.content_type or "image/jpeg"
        # Don't read yet, just check content type
        is_valid, error = validate_image(content_type, 0)
        if not is_valid and "type" in error:
            raise HTTPException(status_code=400, detail=f"Image {idx}: {error}")

    img1_data = await image1.read()
    img2_data = await image2.read()

    # Validate sizes
    for idx, (data, img) in enumerate([(img1_data, image1), (img2_data, image2)], 1):
        is_valid, error = validate_image(img.content_type or "image/jpeg", len(data))
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Image {idx}: {error}")

    comp1, type1 = compress_image(img1_data)
    comp2, type2 = compress_image(img2_data)

    try:
        result = await gemini_service.run_battle(comp1, type1, comp2, type2, roast_mode)
        return result
    except Exception as e:
        logger.error(f"Battle failed: {e}")
        raise HTTPException(status_code=500, detail="Battle failed. Try again.")


# ─── GET /history ────────────────────────────────────────

@router.get("/history", response_model=list[HistoryItem])
async def get_history(user_id: str = "anonymous", limit: int = 20):
    """Get roast history for a user."""
    try:
        return await supabase_service.get_history(user_id, limit)
    except Exception as e:
        logger.error(f"History fetch failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load history.")


# ─── GET /leaderboard ───────────────────────────────────

@router.get("/leaderboard", response_model=list[LeaderboardItem])
async def get_leaderboard(limit: int = 20):
    """Get top roasts by votes."""
    try:
        return await supabase_service.get_leaderboard(limit)
    except Exception as e:
        logger.error(f"Leaderboard fetch failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load leaderboard.")


# ─── POST /vote ──────────────────────────────────────────

@router.post("/vote")
async def vote_on_roast(vote: VoteRequest):
    """Vote on a roast (upvote or downvote)."""
    success = await supabase_service.vote(vote.roast_id, vote.direction)
    if not success:
        raise HTTPException(status_code=500, detail="Vote failed.")
    return {"status": "ok"}


# ─── GET /health ─────────────────────────────────────────

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "RoastMyRoom"}

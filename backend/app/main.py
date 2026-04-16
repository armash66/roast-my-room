"""
RoastMyRoom — FastAPI Application Entry Point.

Production-grade setup with CORS, logging, and lifecycle management.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes import router
from app.middleware.rate_limit import rate_limiter

settings = get_settings()

# ─── Logging ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─── Lifecycle ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown hooks."""
    logger.info(f"🔥 {settings.app_name} starting up...")
    logger.info(f"   Debug mode: {settings.debug}")
    logger.info(f"   Gemini model: {settings.gemini_model}")
    yield
    # Shutdown
    logger.info(f"🛑 {settings.app_name} shutting down...")
    await rate_limiter.close()


# ─── App ─────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description="Upload a room photo. Get roasted. Cry about your interior design choices.",
    version="1.0.0",
    lifespan=lifespan,
)


# ─── CORS ────────────────────────────────────────────────

origins = [origin.strip() for origin in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routes ──────────────────────────────────────────────

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
    }

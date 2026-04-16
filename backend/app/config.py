"""
Application configuration via environment variables.
Uses pydantic-settings for validated, typed config.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "RoastMyRoom"
    debug: bool = False
    allowed_origins: str = "http://localhost:5173"

    # Gemini API
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_max_tokens: int = 1024
    gemini_timeout: int = 60

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"
    rate_limit_requests: int = 5
    rate_limit_window: int = 3600  # 1 hour in seconds

    # Image
    max_image_size: int = 10 * 1024 * 1024  # 10MB
    max_image_dimension: int = 2048  # Compress images larger than this
    allowed_image_types: list[str] = ["image/jpeg", "image/png", "image/webp"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()

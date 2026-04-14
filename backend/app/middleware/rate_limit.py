"""
Rate limiting middleware using Redis.
Limits requests per IP to prevent abuse.
"""

import logging
import time
from typing import Optional

import redis.asyncio as redis

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RateLimiter:
    """
    Redis-backed rate limiter.
    Uses sliding window counter pattern.
    """

    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def get_redis(self) -> redis.Redis:
        """Lazy-initialize Redis connection."""
        if self._redis is None:
            try:
                self._redis = redis.from_url(
                    settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                await self._redis.ping()
                logger.info("Redis connected for rate limiting")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Rate limiting disabled.")
                self._redis = None
        return self._redis

    async def check_rate_limit(self, identifier: str) -> tuple[bool, int, int]:
        """
        Check if a request is within rate limits.

        Args:
            identifier: Usually the client IP address.

        Returns:
            (allowed, remaining, reset_time)
        """
        r = await self.get_redis()
        if r is None:
            # If Redis is down, allow all requests (fail-open)
            return True, settings.rate_limit_requests, 0

        key = f"ratelimit:{identifier}"
        window = settings.rate_limit_window  # seconds
        max_requests = settings.rate_limit_requests
        now = time.time()

        try:
            pipe = r.pipeline()
            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, now - window)
            # Count current requests in window
            pipe.zcard(key)
            # Add current request
            pipe.zadd(key, {str(now): now})
            # Set expiry on the key
            pipe.expire(key, window)
            results = await pipe.execute()

            current_count = results[1]

            if current_count >= max_requests:
                # Get the oldest entry to calculate reset time
                oldest = await r.zrange(key, 0, 0, withscores=True)
                if oldest:
                    reset_time = int(oldest[0][1] + window - now)
                else:
                    reset_time = window
                return False, 0, reset_time

            remaining = max_requests - current_count - 1
            return True, max(0, remaining), 0

        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True, max_requests, 0

    async def close(self):
        """Close Redis connection."""
        if self._redis:
            await self._redis.close()


# Singleton
rate_limiter = RateLimiter()

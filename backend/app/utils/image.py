"""
Image processing utilities.
Handles validation, compression, and format detection.
"""

import io
import logging
from PIL import Image

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def validate_image(content_type: str, size: int) -> tuple[bool, str]:
    """
    Validate image type and size.
    Returns (is_valid, error_message).
    """
    if content_type not in settings.allowed_image_types:
        return False, f"Invalid image type: {content_type}. Allowed: {', '.join(settings.allowed_image_types)}"

    if size > settings.max_image_size:
        max_mb = settings.max_image_size / (1024 * 1024)
        return False, f"Image too large: {size / (1024*1024):.1f}MB. Maximum: {max_mb:.0f}MB"

    return True, ""


def compress_image(image_data: bytes, max_dimension: int = None) -> tuple[bytes, str]:
    """
    Compress and resize image if needed.
    Returns (compressed_data, media_type).
    """
    if max_dimension is None:
        max_dimension = settings.max_image_dimension

    try:
        img = Image.open(io.BytesIO(image_data))

        # Convert RGBA to RGB if needed
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resize if any dimension exceeds max
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            ratio = min(max_dimension / width, max_dimension / height)
            new_size = (int(width * ratio), int(height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f"Image resized from {width}x{height} to {new_size[0]}x{new_size[1]}")

        # Save as JPEG with quality optimization
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=85, optimize=True)
        compressed = output.getvalue()

        logger.info(
            f"Image compressed: {len(image_data) / 1024:.0f}KB -> {len(compressed) / 1024:.0f}KB"
        )

        return compressed, "image/jpeg"

    except Exception as e:
        logger.warning(f"Image compression failed, using original: {e}")
        return image_data, "image/jpeg"

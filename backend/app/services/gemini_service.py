"""
Gemini AI Service — 3-Stage Roast Pipeline.

Stage 1: Vision Analysis (structured object detection)
Stage 2: Roast Generation (mode-aware, specific, funny)
Stage 3: Quality Validation (self-check + retry)

All responses are strict JSON. No markdown, no preamble, no exceptions.
"""

import json
import asyncio
import logging
from typing import AsyncGenerator, Any

from google import genai
from google.genai import types
from google.genai.types import HarmCategory, HarmBlockThreshold

from app.config import get_settings
from app.models.schemas import (
    VisionAnalysis,
    RoastResult,
    RoastScores,
    RoastMode,
    BattleResult,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# ─── Prompt Templates ────────────────────────────────────

STAGE_1_SYSTEM = """You are a precise visual analyst. Your job is to analyze room images and return STRICT JSON.
You must be extremely specific about every object you identify.

RULES:
- Be extremely specific (e.g., "wrinkled grey bedsheet with yellow stains", not "bed")
- Describe textures, colors, conditions of objects
- No humor, no assumptions beyond visible data
- Return ONLY valid JSON, no markdown, no explanations, no preamble

OUTPUT FORMAT (strict JSON):
{
  "objects": ["list of visible items with specific descriptions"],
  "layout": "description of room layout and spatial arrangement",
  "lighting": "description of lighting conditions, sources, quality",
  "colors": ["list of dominant colors visible"],
  "cleanliness": "honest assessment of cleanliness level",
  "notable_details": ["specific observations that stand out"]
}"""

STAGE_2_SYSTEM_TEMPLATE = """You are a brutally honest interior design critic and comedian.
You have been given a structured analysis of a room. Your job is to roast it.

ROAST MODE: {mode}

MODE GUIDELINES:
- mild: Playful, sarcastic, not too harsh. Like a friend teasing you.
- brutal: Aggressive, ruthless, sharp. No mercy but still witty.
- unhinged: Chaotic, absurd, exaggerated humor. Go completely off the rails.

MANDATORY RULES:
1. Reference AT LEAST 3 exact objects from the analysis by name
2. NEVER be generic — no "messy room" or "needs cleaning" without specifics
3. ALWAYS identify and emphasize the single worst offender
4. Keep roast under 5 sentences
5. The worst_offender must be a specific item from the analysis

Return ONLY valid JSON, no markdown, no explanations, no preamble:
{{
  "roast": "your devastating roast here",
  "scores": {{
    "chaos_level": <1-10>,
    "furniture_crime": <1-10>,
    "lighting_sin": <1-10>,
    "overall_disaster": <1-10>
  }},
  "worst_offender": "the single worst item in the room"
}}"""

STAGE_3_VALIDATION_PROMPT = """Review this roast and verify it meets ALL criteria:

1. References at least 3 specific objects from the room analysis
2. Is NOT generic (no vague phrases like "messy room" without specifics)
3. The worst_offender is clearly mentioned in the roast text
4. The roast is funny and matches the requested mode
5. All scores are between 1-10

Room Analysis Objects: {objects}

Roast to validate:
{roast_json}

If the roast PASSES all criteria, return it EXACTLY as-is (valid JSON only).
If it FAILS, generate an improved version that explicitly mentions these objects: {objects}

Return ONLY the final valid JSON, no explanations:
{{
  "roast": "...",
  "scores": {{
    "chaos_level": <1-10>,
    "furniture_crime": <1-10>,
    "lighting_sin": <1-10>,
    "overall_disaster": <1-10>
  }},
  "worst_offender": "..."
}}"""

BATTLE_SYSTEM = """You are a ruthless room battle judge. You've been given roasts and analyses of two rooms.
Determine which room is WORSE (the "winner" of the roast battle is the worse room).

Return ONLY valid JSON:
{{
  "winner": <1 or 2>,
  "reasoning": "why this room is the bigger disaster"
}}"""


class GeminiService:
    """
    Handles all Gemini API interactions with the 3-stage pipeline.
    Fully async, with retry logic for invalid JSON.
    """

    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.gemini_model
        self.max_tokens = settings.gemini_max_tokens

    async def _safe_generate_content(self, model: str, contents: Any, config: Any) -> Any:
        """Wrapper for generate_content with exponential backoff for 503/429 errors."""
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries):
            try:
                return await self.client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                # Catch 503 (Service Unavailable) or 429 (Resource Exhausted)
                error_msg = str(e).lower()
                is_transient = "503" in error_msg or "429" in error_msg or "unavailable" in error_msg or "high demand" in error_msg
                
                if is_transient and attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Gemini API transient error: {error_msg}. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(delay)
                    continue
                raise

    # ─── Stage 1: Vision Analysis ────────────────────────

    async def analyze_image(self, image_data: bytes, media_type: str) -> VisionAnalysis:
        """
        Stage 1: Analyze the room image and extract structured data.
        Returns validated VisionAnalysis or raises on failure.
        """
        for attempt in range(3):
            try:
                response = await self._safe_generate_content(
                    model=self.model,
                    contents=[
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_bytes(data=image_data, mime_type=media_type),
                                types.Part.from_text(text="Analyze this room image. Return STRICT JSON only."),
                            ],
                        )
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=STAGE_1_SYSTEM,
                        max_output_tokens=self.max_tokens,
                        temperature=0.3,
                        response_mime_type="application/json",
                        safety_settings=[
                            types.SafetySetting(
                                category=HarmCategory.HARM_CATEGORY_HARASSMENT,
                                threshold=HarmBlockThreshold.BLOCK_NONE,
                            ),
                            types.SafetySetting(
                                category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold=HarmBlockThreshold.BLOCK_NONE,
                            ),
                            types.SafetySetting(
                                category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                                threshold=HarmBlockThreshold.BLOCK_NONE,
                            ),
                        ],
                    ),
                )

                raw_text = response.text.strip()
                raw_text = self._strip_code_fences(raw_text)

                data = json.loads(raw_text)
                analysis = VisionAnalysis(**data)
                logger.info(f"Stage 1 complete: found {len(analysis.objects)} objects")
                return analysis

            except json.JSONDecodeError as e:
                logger.warning(f"Stage 1 JSON parse failed (attempt {attempt + 1}): {e}. Raw text was: {repr(raw_text)}")
                if attempt == 2:
                    raise ValueError(f"Stage 1 failed after 3 attempts: invalid JSON. Raw output: {repr(raw_text)}") from e
            except Exception as e:
                logger.error(f"Stage 1 error (attempt {attempt + 1}): {e}")
                if attempt == 2:
                    raise

    # ─── Stage 2: Roast Generation ───────────────────────

    async def generate_roast(
        self, analysis: VisionAnalysis, mode: RoastMode
    ) -> RoastResult:
        """
        Stage 2: Generate a roast based on the vision analysis and selected mode.
        Returns validated RoastResult.
        """
        mode_descriptions = {
            RoastMode.MILD: "mild — playful, sarcastic, not too harsh",
            RoastMode.BRUTAL: "brutal — aggressive, ruthless, sharp",
            RoastMode.UNHINGED: "unhinged — chaotic, absurd, exaggerated humor",
        }

        system_prompt = STAGE_2_SYSTEM_TEMPLATE.format(mode=mode_descriptions[mode])
        analysis_json = analysis.model_dump_json()

        for attempt in range(3):
            try:
                response = await self._safe_generate_content(
                    model=self.model,
                    contents=[
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_text(
                                    text=f"Here is the room analysis:\n{analysis_json}\n\nGenerate the roast. Return STRICT JSON only."
                                ),
                            ],
                        )
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        max_output_tokens=self.max_tokens,
                        temperature=0.8,
                        response_mime_type="application/json",
                    ),
                )

                raw_text = response.text.strip()
                raw_text = self._strip_code_fences(raw_text)

                data = json.loads(raw_text)
                result = RoastResult(**data)
                logger.info(f"Stage 2 complete: roast generated in {mode} mode")
                return result

            except json.JSONDecodeError as e:
                logger.warning(f"Stage 2 JSON parse failed (attempt {attempt + 1}): {e}. Raw text was: {repr(raw_text)}")
                if attempt == 2:
                    raise ValueError(f"Stage 2 failed: invalid JSON. Raw output: {repr(raw_text)}") from e
            except Exception as e:
                logger.error(f"Stage 2 error (attempt {attempt + 1}): {e}")
                if attempt == 2:
                    raise

    # ─── Stage 3: Quality Validation ─────────────────────

    async def validate_roast(
        self, roast: RoastResult, analysis: VisionAnalysis
    ) -> RoastResult:
        """
        Stage 3: Self-check the roast quality.
        If the roast is generic or doesn't reference enough objects, regenerate.
        """
        # Quick local validation first
        objects_referenced = sum(
            1 for obj in analysis.objects
            if any(word.lower() in roast.roast.lower() for word in obj.split()[:2])
        )

        if objects_referenced >= 3 and roast.worst_offender.lower() in roast.roast.lower():
            logger.info("Stage 3: Local validation passed, skipping API call")
            return roast

        # If local check fails, ask Gemini to validate and fix
        logger.info(f"Stage 3: Only {objects_referenced} objects referenced, running Gemini validation")

        objects_str = ", ".join(analysis.objects[:10])
        validation_prompt = STAGE_3_VALIDATION_PROMPT.format(
            objects=objects_str,
            roast_json=roast.model_dump_json(),
        )

        try:
            response = await self._safe_generate_content(
                model=self.model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=validation_prompt)],
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction="You are a quality validator. Return ONLY valid JSON.",
                    max_output_tokens=self.max_tokens,
                    temperature=0.3,
                    response_mime_type="application/json",
                ),
            )

            raw_text = response.text.strip()
            raw_text = self._strip_code_fences(raw_text)
            data = json.loads(raw_text)
            validated = RoastResult(**data)
            logger.info("Stage 3: Validation complete, roast improved")
            return validated

        except Exception as e:
            logger.warning(f"Stage 3 validation failed, returning original: {e}")
            return roast

    # ─── Full Pipeline ───────────────────────────────────

    async def run_pipeline(
        self, image_data: bytes, media_type: str, mode: RoastMode
    ) -> tuple[VisionAnalysis, RoastResult]:
        """
        Execute the full 3-stage pipeline.
        Returns (analysis, validated_roast).
        """
        # Stage 1: Analyze
        analysis = await self.analyze_image(image_data, media_type)

        # Stage 2: Generate roast
        roast = await self.generate_roast(analysis, mode)

        # Stage 3: Validate and improve if needed
        validated_roast = await self.validate_roast(roast, analysis)

        return analysis, validated_roast

    async def run_pipeline_streaming(
        self, image_data: bytes, media_type: str, mode: RoastMode
    ) -> AsyncGenerator[dict, None]:
        """
        Execute the pipeline with streaming updates for the frontend.
        Yields stream chunks as dicts.
        """
        # Stage 1
        yield {"type": "status", "data": "analyzing your life choices..."}
        try:
            analysis = await self.analyze_image(image_data, media_type)
            yield {
                "type": "analysis",
                "data": analysis.model_dump(),
            }
        except Exception as e:
            yield {"type": "error", "data": f"Vision analysis failed: {str(e)}"}
            return

        # Stage 2
        yield {"type": "status", "data": "consulting interior design lawyers..."}
        try:
            roast = await self.generate_roast(analysis, mode)
        except Exception as e:
            yield {"type": "error", "data": f"Roast generation failed: {str(e)}"}
            return

        # Stage 3
        yield {"type": "status", "data": "preparing emotional support..."}
        try:
            validated_roast = await self.validate_roast(roast, analysis)
        except Exception as e:
            # Use unvalidated roast if validation fails
            validated_roast = roast
            logger.warning(f"Validation failed, using unvalidated roast: {e}")

        # Stream the roast text character by character for typewriter effect
        yield {"type": "roast_start", "data": ""}
        for char in validated_roast.roast:
            yield {"type": "roast_char", "data": char}

        # Send scores
        yield {
            "type": "scores",
            "data": validated_roast.scores.model_dump(),
        }

        # Send worst offender
        yield {
            "type": "worst_offender",
            "data": validated_roast.worst_offender,
        }

        # Send complete result
        yield {
            "type": "done",
            "data": validated_roast.model_dump(),
        }

    # ─── Battle Mode ─────────────────────────────────────

    async def run_battle(
        self,
        image1_data: bytes,
        image1_type: str,
        image2_data: bytes,
        image2_type: str,
        mode: RoastMode,
    ) -> BattleResult:
        """
        Run a battle between two rooms.
        Roasts both, then determines the winner (worse room).
        """
        # Analyze and roast both rooms
        analysis1, roast1 = await self.run_pipeline(image1_data, image1_type, mode)
        analysis2, roast2 = await self.run_pipeline(image2_data, image2_type, mode)

        # Determine winner
        battle_prompt = f"""
Room 1 Analysis: {analysis1.model_dump_json()}
Room 1 Roast: {roast1.model_dump_json()}

Room 2 Analysis: {analysis2.model_dump_json()}
Room 2 Roast: {roast2.model_dump_json()}

Which room is the bigger disaster? Return JSON with "winner" (1 or 2) and "reasoning".
"""
        try:
            response = await self._safe_generate_content(
                model=self.model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=battle_prompt)],
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=BATTLE_SYSTEM,
                    max_output_tokens=512,
                    temperature=0.5,
                    response_mime_type="application/json",
                ),
            )
            raw_text = response.text.strip()
            raw_text = self._strip_code_fences(raw_text)
            battle_data = json.loads(raw_text)

            return BattleResult(
                room1_roast=roast1,
                room2_roast=roast2,
                winner=battle_data["winner"],
                reasoning=battle_data["reasoning"],
            )
        except Exception as e:
            logger.error(f"Battle judging failed: {e}")
            # Fallback: compare overall_disaster scores
            winner = 1 if roast1.scores.overall_disaster >= roast2.scores.overall_disaster else 2
            return BattleResult(
                room1_roast=roast1,
                room2_roast=roast2,
                winner=winner,
                reasoning="Judged by overall disaster score comparison.",
            )

    # ─── Helpers ─────────────────────────────────────────

    @staticmethod
    def _strip_code_fences(text: str) -> str:
        """Extract the JSON object from the text, ignoring conversational wrappers."""
        text = text.strip()
        # Find the first { and the last }
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            return text[start_idx:end_idx+1]
        return text


# Singleton instance
gemini_service = GeminiService()

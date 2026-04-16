import asyncio
import os
import io
import sys
import json
import traceback
from PIL import Image

sys.path.insert(0, os.path.abspath('backend'))
from dotenv import load_dotenv
load_dotenv('backend/.env')

from app.services.gemini_service import gemini_service
from google.genai import types

async def test():
    img = Image.new('RGB', (100, 100), color = 'red')
    b = io.BytesIO()
    img.save(b, format='JPEG')
    img_bytes = b.getvalue()
    
    print("Testing pipeline Stage 1...")
    try:
        response = await gemini_service.client.aio.models.generate_content(
            model=gemini_service.model,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                        types.Part.from_text(text="Analyze this room image. Return STRICT JSON only."),
                    ],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction="""You are a precise visual analyst. Your job is to analyze room images and return STRICT JSON.
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
}""",
                max_output_tokens=1000,
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        print("TEXT Output:")
        print(repr(response.text))
        print("---")
        data = json.loads(response.text)
        print("PARSE SUCCESS: ", type(data))
    except Exception as e:
        print("EXCEPTION:")
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())

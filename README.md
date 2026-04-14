# RoastMyRoom

Upload a photo of your room. Get brutally honest AI-powered interior design critiques. Cry.

## Tech Stack

**Frontend:** React + TypeScript, TailwindCSS v4, Framer Motion, Vite

**Backend:** FastAPI (fully async), Pydantic validation

**AI:** Claude (claude-sonnet-4-20250514) with vision

**Infrastructure:** Supabase (database + storage), Redis (rate limiting)

## Features

- Drag-and-drop room photo upload
- Three roast modes: Mild, Brutal, Unhinged
- Real-time streaming roast with typewriter effect
- Animated score bars (Chaos Level, Furniture Crime, Lighting Sin, Overall Disaster)
- Worst offender identification and highlighting
- Shareable roast cards (image generation)
- Room vs Room battle mode
- Roast history and leaderboard with voting
- Rate limiting (5 requests/hour/IP)
- Image compression before AI processing

## Project Structure

```
roast-room/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API abstraction layer
│   │   ├── pages/      # Page components
│   │   └── types/      # TypeScript types
│   └── ...
├── backend/            # FastAPI
│   ├── app/
│   │   ├── api/        # Route handlers
│   │   ├── services/   # Claude + Supabase services
│   │   ├── models/     # Pydantic models
│   │   ├── middleware/  # Rate limiting
│   │   └── utils/      # Image processing
│   └── requirements.txt
└── supabase/
    └── schema.sql      # Database schema
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (optional, for rate limiting)
- Supabase account (optional, for persistence)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
# Edit .env with your API keys

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database (Supabase)

1. Create a Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a storage bucket named `roast-images` (public)
4. Add your Supabase credentials to `backend/.env`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roast` | Stream a room roast (SSE) |
| POST | `/api/roast/sync` | Get a room roast (non-streaming) |
| POST | `/api/battle` | Battle two rooms |
| GET | `/api/history` | Get roast history |
| GET | `/api/leaderboard` | Get top roasts |
| POST | `/api/vote` | Vote on a roast |
| GET | `/api/health` | Health check |

## AI Pipeline

1. **Stage 1 — Vision Analysis:** Extracts structured data from the room image (objects, layout, lighting, colors, cleanliness)
2. **Stage 2 — Roast Generation:** Generates a mode-specific roast referencing 3+ objects from the analysis
3. **Stage 3 — Quality Validation:** Self-checks specificity and regenerates if the roast is too generic

## License

MIT

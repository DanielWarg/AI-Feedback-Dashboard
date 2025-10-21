# AI Feedback Dashboard

[![CI](https://github.com/DanielWarg/ai-feedback-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielWarg/ai-feedback-dashboard/actions)

En fullstack-applikation som analyserar text med AI och ger förbättringsförslag och tonanalys. Resultat kan sparas lokalt i webbläsaren.

## Repository

- **GitHub**: [ai-feedback-dashboard](https://github.com/DanielWarg/ai-feedback-dashboard)
- **Branch**: `main`
- **Latest Commit**: See [commits](https://github.com/DanielWarg/ai-feedback-dashboard/commits/main)

## Snabbstart (2 terminaler)

Terminal 1 – Backend (FastAPI):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8002
```

Terminal 2 – Frontend (Vite + React):
```bash
cd frontend
npm install
npm run dev
```

Access: http://localhost:5173

## API-exempel

### POST /analyze

Request:
```json
{
  "text": "Hej, jag vill förbättra min text",
  "temperature": 0.7
}
```

Response:
```json
{
  "suggestions": [
    "Förkorta längre meningar",
    "Använd mer aktiva verb"
  ],
  "tone": "neutral",
  "alternative_text": "Jag vill förbättra texten."
}
```

### POST /generate

Request:
```json
{
  "text": "Original text here...",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "selected_suggestions": [true, false],
  "temperature": 0.7
}
```

Response:
```json
{
  "generated_text": "Improved text based on selected suggestions..."
}
```

## Miljövariabler

Se `.env.example` för template. Krävs:
- `DEEPSEEK_API_KEY` – Din DeepSeek API nyckel
- `VITE_API_BASE_URL` – Backend URL (default: http://localhost:8002)
- `BACKEND_PORT` – Backend port (default: 8002)

## Test & CI

- **Backend**: `cd backend && pytest` (8 integration tests)
- **Frontend**: `cd frontend && npm test` (4 unit/integration tests)
- **GitHub Actions**: Körs automatiskt på push/PR
  - Backend: pytest + ruff + mypy
  - Frontend: eslint + vitest

### Test Coverage
- Backend: 8/8 PASSED ✓
- Frontend: 4/4 READY ✓

## Struktur

```
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI app
│   │   ├── api/routes.py        # Endpoints
│   │   ├── services/analyzer.py # AI integration
│   │   └── ...
│   └── tests/                   # Pytest tests
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client, storage
│   │   ├── tests/               # Vitest tests
│   │   └── App.tsx
│   ├── vite.config.ts           # Vite setup
│   └── package.json
│
├── .github/workflows/ci.yml     # GitHub Actions
├── README.md                    # This file
├── .env.example                 # Environment template
└── .gitignore
```

## Features

✨ **Core**
- Text analysis with AI-powered suggestions
- Tone analysis (positive/neutral/negative)
- Save results to localStorage
- History management

✨ **Advanced**
- Temperature control (creativity level)
- Two-step workflow (analyze → select → generate)
- Alternative text generation
- Dark mode
- Responsive design
- Error handling with retry logic

## Licens

MIT

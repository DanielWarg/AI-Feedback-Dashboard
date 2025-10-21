# AI Feedback Dashboard

En fullstack-applikation som analyserar text med AI och ger förbättringsförslag och tonanalys. Resultat kan sparas lokalt i webbläsaren.

## Snabbstart (2 terminaler)

Terminal 1 – Backend (FastAPI):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

Terminal 2 – Frontend (Vite + React):
```bash
cd frontend
npm install
npm run dev
```

## API-exempel

POST /analyze

Request:
```json
{ "text": "Hej, jag vill förbättra min text" }
```

Response:
```json
{
  "suggestions": ["Förkorta meningarna", "Använd mer aktiva verb"],
  "tone": "neutral"
}
```

## Miljövariabler

Se `.env.example`. Backend läser `DEEPSEEK_API_KEY` om satt, annars används mockad analys.

## Test & CI

- Backend: pytest (minst 5 tester)
- Frontend: Vitest + RTL (minst 3 tester)
- GitHub Actions kör tester på push/PR

## Struktur

- backend/src – FastAPI-kod
- backend/tests – pytest (unit/integration)
- frontend/src – React + TS
- frontend/src/tests – Vitest (unit/integration)

## Remote repo

Använd GitHub-repot `AI-Feedback-Dashboard` som fjärr (origin) när det är skapat: [GitHub-repo](https://github.com/DanielWarg/AI-Feedback-Dashboard.git)

## Licens

MIT

<!-- a576d0f1-59b3-43cb-b57a-b765557d095a ae6de5c9-bcb6-47f2-83da-43bb9222bdc7 -->
# AI Feedback Dashboard - Implementationsplan

## 1. Projektstruktur & Initialisering

**Skapa mappstruktur:**
```
/backend
  /src
    /api
    /services
    /models
    /utils
  /tests
/frontend
  /src
    /components
    /services
    /hooks
    /types
    /utils
    /tests
```

**Root-filer:**
- `.gitignore` (node_modules, .venv, **pycache**, dist, coverage, .DS_Store, .env)
- `.env.example` med `DEEPSEEK_API_KEY=your_key_here`
- `README.md` med kompletta instruktioner
- `.github/workflows/ci.yml` för CI/CD

## 2. Backend - FastAPI (Python)

**Setup (`backend/`):**
- `requirements.txt`: fastapi, uvicorn, pydantic, httpx, python-dotenv, pytest, pytest-asyncio, pytest-cov
- `pyproject.toml` för Black & Ruff konfiguration
- Virtual environment: `.venv`

**API Implementation (`backend/src/`):**

**`main.py`:**
- FastAPI app med CORS middleware
- Health check endpoint: `GET /health`
- Main endpoint: `POST /analyze`
- Swagger docs på `/docs`

**`models/schemas.py`:**
```python
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

class AnalyzeResponse(BaseModel):
    suggestions: list[str]
    tone: Literal["positive", "neutral", "negative"]
```

**`services/analyzer.py`:**
- `DeepSeekAnalyzer` klass med async metoder
- `analyze_text()` - huvudlogik som använder DeepSeek Chat v3.1
- Prompt engineering för att få strukturerad output med exakt 2-3 förbättringsförslag + tonanalys
- Temperature=0 för determinism
- `MockAnalyzer` klass för när API-nyckel saknas (deterministiska resultat baserat på textlängd och innehåll)

**`utils/config.py`:**
- Läs miljövariabler via pydantic Settings
- Validera DEEPSEEK_API_KEY (valfri)

**Backend-tester (`backend/tests/`):**
- `test_api.py`:
  - Test 1: Tom text returnerar 400
  - Test 2: Giltig text returnerar korrekt struktur (suggestions list, tone värde)
  - Test 3: Tone är ett av tre giltiga värden
  - Test 4: Suggestions innehåller 2-3 items
  - Test 5: MockAnalyzer ger deterministiska resultat
- `test_analyzer.py`:
  - Test för både DeepSeek och Mock implementationer
- Pytest coverage > 80%

## 3. Frontend - React + TypeScript + Vite

**Setup (`frontend/`):**
- Vite + React + TypeScript template
- `package.json` dependencies: react, react-dom, axios
- DevDependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, tailwindcss, postcss, autoprefixer, eslint, prettier
- `tailwind.config.js` med custom färgschema
- `tsconfig.json` med strict mode

**Komponenter (`frontend/src/components/`):**

**`TextAnalyzer.tsx` (huvudkomponent):**
- Textarea för textinput (min 1, max 5000 tecken)
- Character counter
- "Analysera text"-knapp (disabled vid tom text eller loading)
- Loading spinner med smooth animation
- Error toast/alert för felmeddelanden
- Results display med fade-in animation

**`ResultsCard.tsx`:**
- Visar suggestions som styled lista med ikoner
- Tone badge med färgkodning (grön=positive, blå=neutral, röd=negative)
- "Spara resultat"-knapp
- Smooth transitions

**`HistoryPanel.tsx`:**
- Sidebar/drawer med sparade resultat från localStorage
- Visa tidsstämpel för varje sparat resultat
- "Radera"-knapp per item
- "Rensa alla"-knapp
- Responsiv design (collapse på mobil)

**Services (`frontend/src/services/`):**

**`api.ts`:**
```typescript
interface AnalyzeRequest {
  text: string;
}

interface AnalyzeResponse {
  suggestions: string[];
  tone: 'positive' | 'neutral' | 'negative';
}

export const analyzeText = async (text: string): Promise<AnalyzeResponse>
```
- Axios instance med baseURL från `import.meta.env.VITE_API_BASE_URL`
- Error handling med typed errors

**`storage.ts`:**
- `saveResult()` - lägg till i localStorage array
- `getResults()` - hämta alla sparade resultat
- `deleteResult()` - ta bort specifikt resultat
- `clearResults()` - rensa allt
- TypeScript interfaces för saved results

**Custom Hooks (`frontend/src/hooks/`):**

**`useTextAnalyzer.ts`:**
- State management för text, loading, error, results
- `analyze()` funktion som anropar API
- Error handling

**`useLocalStorage.ts`:**
- Generic hook för localStorage med TypeScript
- Auto-sync mellan tabs

**Design & UX:**
- Tailwind CSS med custom design system
- Gradient backgrounds och subtle shadows
- Smooth transitions och animations
- Responsive design (mobile-first)
- Loading states med skeleton screens
- Toast notifications för feedback
- Accessibility: ARIA labels, keyboard navigation, focus states

**Frontend-tester (`frontend/src/tests/`):**
- `TextAnalyzer.test.tsx`:
  - Test 1: Renderar formulär korrekt
  - Test 2: Tom text disablar submit-knapp
  - Test 3: Visar loading state vid submit
  - Test 4: Visar resultat efter lyckad analys (mocked API)
  - Test 5: Visar felmeddelande vid API-fel
- `storage.test.ts`:
  - Test för localStorage operations
- Vitest coverage > 70%

## 4. Miljövariabler

**`.env.example` (root):**
```
# Backend
DEEPSEEK_API_KEY=your_api_key_here
BACKEND_PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

**Backend använder:** `python-dotenv`
**Frontend använder:** Vite's `import.meta.env`

## 5. CI/CD - GitHub Actions

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Python 3.11
      - Install dependencies
      - Run Black check
      - Run Ruff
      - Run pytest with coverage
      
  frontend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node 20
      - npm ci
      - Run ESLint
      - Run Prettier check
      - Run Vitest
```

**Status badge i README**

## 6. README.md

**Innehåll:**
- Projektbeskrivning
- Features med screenshots/demo GIF
- Tech stack
- Förutsättningar (Python 3.11+, Node 20+)
- Installation & Setup (2 kommandosteg)
- Miljövariabler guide
- API-dokumentation med exempel
- Testning instruktioner
- CI/CD status badge
- Projektstruktur overview
- Bidrag guidelines

**Kör-exempel:**
```bash
# Terminal 1 - Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 7. Extra kvalitetshöjande features

**Förbättringar för UX:**
- Dark mode toggle (Tailwind dark: classes)
- Keyboard shortcuts (Cmd/Ctrl+Enter för analys)
- Export resultat som JSON/text
- Copy-to-clipboard för suggestions
- Ångra senaste ändring i textarea
- Auto-save draft i localStorage

**Tekniska förbättringar:**
- Rate limiting i backend (via slowapi eller custom middleware)
- Request logging med strukturerad format
- Error tracking med stack traces i development
- API response caching för identiska requests
- Optimistic UI updates

**Tillgänglighet:**
- Semantisk HTML
- ARIA labels på alla interaktiva element
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators
- Screen reader support
- Color contrast WCAG AA

**Performance:**
- Lazy loading av HistoryPanel
- Debounce på character counter
- Memoization av React components
- Code splitting
- Optimized Tailwind build (purge unused CSS)

## 7. Testmappstruktur (best practice)

### Backend (pytest)
```
/backend
  /src
  /tests
    /unit
      test_analyzer.py
      test_utils.py
    /integration
      test_api.py
    conftest.py            # delade fixtures (t.ex. testklient)
pytest.ini                 # testpaths=tests, markers, addopts
.coveragerc                # include=src/*, omit=__init__.py
```
- Namnkonvention: `test_*.py`
- Markers: `@pytest.mark.unit`, `@pytest.mark.integration`
- Fixtures i `conftest.py` (FastAPI TestClient/AsyncClient, mockad analyzer)
- Coverage rapport mot `src/` endast

### Frontend (Vitest + RTL)
```
/frontend
  /src
    /components
    /services
    /hooks
    /types
    /utils
    /tests
      /unit
        TextAnalyzer.test.tsx
        storage.test.ts
      /integration
        App.integration.test.tsx
      setup.ts              # jest-dom, RTL-konfiguration
      __mocks__/            # ev. axios- eller service-mockar
vitest.config.ts            # environment jsdom, setupFiles
```
- Namnkonvention: `*.test.ts`/`*.test.tsx` (inte `.spec` för konsekvens)
- Testmiljö: `jsdom`, `@testing-library/jest-dom` i `setup.ts`
- Mockning: `vi.mock()` och/eller `__mocks__`
- Mirrora mappstrukturen från `src/` under `src/tests/`

## 8. Testing Strategy

**Backend - Minimum 5 tester:**
1. POST /analyze med tom text → 400
2. POST /analyze med giltig text → 200 med korrekt struktur
3. Tone är ett av tre giltiga värden
4. Suggestions är array med 2-3 items
5. MockAnalyzer ger deterministiska resultat för samma input

**Frontend - Minimum 5 tester:**
1. Form validering - tom text disablar knapp
2. Render av results efter mocked API success
3. Error display vid API failure  
4. localStorage save/load functionality
5. Character counter uppdateras korrekt

**CI kräver att alla tester passerar innan merge**

## 9. Definition of Done

- ✅ Alla endpoints implementerade och dokumenterade
- ✅ Frontend visar resultat och hanterar fel korrekt
- ✅ localStorage funktionalitet fungerar
- ✅ Minst 8 tester totalt (5 backend + 3 frontend minimum)
- ✅ Alla tester gröna lokalt och i CI
- ✅ Lint och type-checking passerar
- ✅ README komplett med alla sektioner
- ✅ .env.example finns
- ✅ .gitignore konfigurerad
- ✅ Inga secrets i repo
- ✅ Modern, responsiv UI med Tailwind CSS
- ✅ Loading states och error handling
- ✅ Accessibility requirements uppfyllda

### To-dos

- [ ] Skapa projektstruktur, .gitignore, .env.example och initiala konfigurationsfiler
- [ ] Sätt upp Python virtual environment, installera dependencies, konfigurera FastAPI app med CORS
- [ ] Implementera Pydantic models (AnalyzeRequest, AnalyzeResponse) med validering
- [ ] Implementera DeepSeekAnalyzer och MockAnalyzer klasser med prompt engineering för DeepSeek Chat v3.1
- [ ] Implementera FastAPI endpoints (/health, /analyze) med error handling
- [ ] Skriva minst 5 pytest-tester för validering, struktur och affärslogik
- [ ] Skapa Vite + React + TypeScript projekt, installera dependencies, konfigurera Tailwind CSS
- [ ] Implementera API service (axios) och localStorage service med TypeScript interfaces
- [ ] Skapa custom hooks (useTextAnalyzer, useLocalStorage) för state management
- [ ] Bygga huvudkomponenter (TextAnalyzer, ResultsCard, HistoryPanel) med Tailwind styling
- [ ] Implementera UX-förbättringar (loading states, animations, error handling, accessibility)
- [ ] Skriva minst 3 Vitest/RTL-tester för form validering, API integration och localStorage
- [ ] Konfigurera GitHub Actions workflow för backend och frontend testing
- [ ] Skriva komplett README.md med installation, API-docs, exempel och CI badge
- [ ] Kör full integration test, verifiera att alla krav uppfylls och DoD checkas av

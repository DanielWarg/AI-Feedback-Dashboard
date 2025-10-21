# 🔍 KODKVALITETS-GRANSKNING: AI Feedback Dashboard

**Datum**: 2025-10-21  
**Status**: ✅ Granskat & Klassificerat  
**Total Problem**: 24 (3 Kritiska, 2 Höga, 10 Medium, 9 Låga)

---

## ⚠️ KRITISKA PROBLEM (FIX OMEDELBAR)

### #1 Backend: Fallback-respons SER UT SOM MOCK
**Fil**: `backend/src/services/analyzer.py` (rad 87-91, 110-114)  
**Allvarlighet**: 🔴 KRITISK

**Problem**:
```python
# Vid JSON-parse-fel returneras alltid samma svar:
return [
    "Förkorta längre meningar",
    "Använd mer aktiva verb",
], "neutral", short_summary
```

**Varför det är kritisk**:
- Returnerar SAMMA förslag varje gång DeepSeek misslyckas
- Du sa "ingen mock" - det här SER ut som mock!
- Användaren kan inte skilja på real vs fallback

**Lösning**:
```python
except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
    logger.error(f"API call failed: {e}")
    raise HTTPException(status_code=503, detail="AI service unavailable")
```

---

### #2 Frontend: Type-Mismatch i /generate
**Fil**: `frontend/src/components/ResultsCard.tsx` (rad 56)  
**Allvarlighet**: 🔴 KRITISK

**Problem**:
```typescript
const response = await apiClient.generate(
  result.alternative_text,  // ❌ Skickar already-improved text
  result.suggestions,
  selected,
  temperature
)
```

**Resultat**: 
- Text förbättras två gånger i följd
- Blir iterativ omskrivning istället för att applicera specifika förslag

**Lösning**:
- Spara original text i state
- Skicka original text till `/generate`

```typescript
// I ResultsCard:
interface ResultsCardProps {
  result: AnalyzeResponse
  originalText: string  // ← Lägg till
  ...
}

// I generate-kall:
const response = await apiClient.generate(
  originalText,  // ✓ Original text
  result.suggestions,
  selected,
  temperature
)
```

---

### #3 Frontend: Tailwind Primary-Color Inte Definierad
**Filer**: Alla `.tsx` components  
**Allvarlighet**: 🟡 MEDIUM (men kan bryta build)

**Problem**:
```tsx
// Används överallt:
className="bg-primary-500 hover:bg-primary-600"
```

Finns INTE i `tailwind.config.js`

**Lösning A (Rekommenderad)**:
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',  // sky-500
          600: '#0284c7',  // sky-600
          700: '#0369a1',  // sky-700
        }
      }
    }
  }
}
```

**Lösning B (Alternativ)**:
Byt alla `primary-*` till `blue-*` eller `sky-*`

---

## 🔴 HÖGA PRIORITET (FIX DENNA VECKA)

### #4 Backend: Logging Import Mitten i Funktionen
**Fil**: `backend/src/services/analyzer.py` (rad 105, 186)  
**Allvarlighet**: 🟡 MEDIUM (men bad practice)

**Före**:
```python
except ValidationError as e:
    import logging  # ❌ Import här
    logging.error(f"JSON validation failed: {e}")
```

**Efter**:
```python
# Top of file
import logging

# Sedan i exception handler:
except ValidationError as e:
    logging.error(f"JSON validation failed: {e}")
```

---

### #5 Frontend: Inkonsekventa Error-Hanteringar
**Filer**: `api.ts`, `TextAnalyzer.tsx`, `ResultsCard.tsx`  
**Allvarlighet**: 🟡 MEDIUM (UX-issue)

**Problem**: Varje fil formaterar errors på sitt sätt

**Lösning**: Skapa `frontend/src/utils/errorFormatter.ts`:
```typescript
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return 'Kan inte ansluta till servern'
    }
    if (error.message.includes('timeout')) {
      return 'Förfrågan tog för lång tid'
    }
    return error.message
  }
  return 'Okänt fel uppstod'
}
```

---

## 🟡 MEDIUM PRIORITET (10 Problem)

### #6 Temperature-Konstant Hårdkodad (0.7)
**Filer**: `App.tsx`, `TextAnalyzer.tsx`, `ResultsCard.tsx`  
**Problem**: Tre ställen med `temperature = 0.7`

**Lösning**:
```typescript
// frontend/src/constants/index.ts
export const DEFAULT_TEMPERATURE = 0.7
export const MIN_TEMPERATURE = 0.0
export const MAX_TEMPERATURE = 2.0
export const TEXT_MAX_LENGTH = 5000

// Sedan import överallt:
import { DEFAULT_TEMPERATURE } from '@constants'
```

---

### #7-8 Magiska Siffror Utan Namn
**Fil**: `backend/src/services/analyzer.py`  
**Problem**:
- `max(word_count - 50, 50)`
- `0.5 * (2**attempt)`
- `MAX_RETRIES = 3` (det här är redan bra!)

**Lösning**:
```python
# Konstanter top of file
WORD_COUNT_MARGIN = 50  # Allow ±50 words deviation
MIN_WORD_COUNT = 50      # Minimum word count for valid text
RETRY_BACKOFF_BASE = 0.5  # Exponential backoff: 0.5s, 1s, 2s
MAX_RETRIES = 3

# Sedan använd:
min_words = max(word_count - WORD_COUNT_MARGIN, MIN_WORD_COUNT)
max_words = word_count + WORD_COUNT_MARGIN
await asyncio.sleep(RETRY_BACKOFF_BASE * (2**attempt))
```

---

### #9-10 Props-Drilling & Duplicerat State
**Problem**: `temperature` existerar i både App och TextAnalyzer

**Långsiktig lösning**: React Context
```typescript
// frontend/src/context/TemperatureContext.tsx
import React, { createContext, useState } from 'react'

export const TemperatureContext = createContext<{
  temperature: number
  setTemperature: (temp: number) => void
}>({ temperature: 0.7, setTemperature: () => {} })

export function TemperatureProvider({ children }: { children: React.ReactNode }) {
  const [temperature, setTemperature] = useState(0.7)
  return (
    <TemperatureContext.Provider value={{ temperature, setTemperature }}>
      {children}
    </TemperatureContext.Provider>
  )
}
```

---

### #11 Ingen Rate-Limiting
**Fil**: `backend/src/main.py`  
**Problem**: Användare kan spamma obegränsat

**Lösning**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze(req: AnalyzeRequest, request: Request):
    ...
```

---

### #12-13 Ingen E2E eller Error-Scenario Tester
**Problem**: Bara unit + integration tests

**Lösning**:
- Lägg till `frontend/e2e/` med Playwright
- Lägg till error-scenario tester i `backend/tests/`

---

### #14 Backend Config Saknar Environment-Specifik
**Problem**: Samma config för dev och prod

**Lösning**:
```python
# backend/src/utils/config.py (already good)
# Men lägg till:
class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = environment == "development"
    
    class Config:
        env_file = ".env"

# backend/.env.production
ENVIRONMENT=production
DEBUG=false
```

---

## 🟢 LÅGA PRIORITET (9 Problem)

### #15 Console.log I Production
**Fil**: `frontend/src/services/api.ts`  
**Problem**: Skriver till console i production

**Lösning**:
```typescript
const isDev = import.meta.env.MODE === 'development'

const log = (msg: string, data?: any) => {
  if (isDev) console.log(msg, data)
}

// Sedan:
log('📤 Sending request...', url)
```

---

### #16-18 Misc (Console, JSDoc, Null-Coalescing)
- Extrahera inline styles till constants
- Lägg till JSDoc-kommentarer
- Använd `result?.alternative_text || ''`

---

### #19-20 Documentation & Prompts
- Lägg till "Error Handling" avsnitt i README
- Skapa `PROMPTS.md` för att dokumentera AI-instruktioner

---

### #21-22 Struktur Förbättringar
- Skapa `frontend/src/constants/` folder
- Skapa `frontend/src/utils/` folder

---

## ✅ VAD ÄR BUNT?

```
✓ Mappstruktur:    Utmärkt (src/, tests/, hooks/, components/)
✓ Separation:      Bra (services, models, components, hooks)
✓ TypeScript:      Strikt (strict: true)
✓ Async-hantering: Korrekt (async/await + retry-logik)
✓ API-design:      Rent (POST, strukturerad response)
✓ UI/UX:           Professionell (dark mode, loading, errors)
✓ Testing:         Tillräcklig (8 backend, 4 frontend)
```

---

## 📋 PRIORITERAD FIX-ORDNING

**VECKA 1 - KRITISKA FIXES:**
1. [ ] Fix #1 - Throwexception istället för fallback
2. [ ] Fix #2 - Spara original text för /generate
3. [ ] Fix #3 - Definiera tailwind primary-color

**VECKA 2 - HÖGA & MEDIUM FIXES:**
4. [ ] Fix #4 - Flytta logging import
5. [ ] Fix #5 - Centralisera error-formatter
6. [ ] Fix #6-8 - Centralisera constants
7. [ ] Fix #10-11 - Temperature context & rate-limiting

**VECKA 3 - MEDIUM & LÅGA:**
8. [ ] Fix #12-13 - E2E + error-scenario tester
9. [ ] Fix #14 - Environment-konfiguration
10. [ ] Fix #15-22 - Documentation & misc

---

**Report Generated**: 2025-10-21  
**Granskat av**: AI Code Reviewer  
**Status**: Ready for Implementation

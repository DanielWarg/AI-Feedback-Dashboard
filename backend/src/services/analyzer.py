from __future__ import annotations

import asyncio

import httpx
from pydantic import ValidationError

from ..models.llm import LLMAnalyzeOutput, Tone
from ..utils.config import settings

# Constants
MAX_RETRIES = 3
SERVER_ERROR_CODE = 500
MIN_SUGGESTIONS = 2
MAX_SUGGESTIONS = 3


class DeepSeekAnalyzer:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.model = "deepseek-chat"
        self.base_url = "https://api.deepseek.com/v1/chat/completions"

    def _build_prompt(self, text: str) -> str:
        word_count = len(text.split())
        min_words = max(word_count - 50, 50)
        max_words = word_count + 50
        
        return (
            "Du är en professionell språkexpert som specialiserar dig på att ge konstruktiv feedback på skrivna texter. "
            "Din uppgift är att analysera texten nedan och ge konkreta, användbara förbättringsförslag.\n\n"
            "INSTRUKTIONER:\n"
            "1. Ge 2-3 KONKRETA och SPECIFISKA förbättringsförslag som direkt adresserar texten.\n"
            "2. Förslagen ska fokusera på: struktur, klarhet, ordval, meningsbyggnad, tydlighet och engagement.\n"
            "3. Ge exempel eller kontextuell förklaring för varje förslag.\n"
            "4. Analysera TONEN och returnera EXAKT en av dessa: 'positive', 'neutral', eller 'negative'.\n"
            "5. Skapa en FÖRBÄTTRAD VERSION av texten som applicerar de viktigaste förslagen.\n"
            f"   - VIKTIGT: alternative_text måste ha mellan {min_words}-{max_words} ord (original: {word_count} ord)\n"
            "   - Behåll ~80-90% av originaltext\n"
            "   - Gör minimala ändringar för att implementera förslagen\n"
            "   - INTE en sammanfattning - samma längd och struktur som original\n"
            "6. Returnera ENDAST JSON-objektet (inget extra text) med dessa EXAKTA nycklar:\n"
            "   - 'suggestions': array av 2-3 strings\n"
            "   - 'tone': ONE OF: 'positive', 'neutral', 'negative'\n"
            f"   - 'alternative_text': förbättrad text ({min_words}-{max_words} ord)\n\n"
            "VIKTIGT: Tone måste vara EXAKT en av: positive, neutral, negative\n"
            "VIKTIGT: alternative_text MÅSTE ha samma längd som original (±50 ord), INTE kortare!\n\n"
            "EXEMPEL PÅ FÖRVÄNTAD JSON:\n"
            "{\n"
            "  \"suggestions\": [\"Förslag 1 med detalj\", \"Förslag 2 med detalj\"],\n"
            '  \"tone\": "neutral",\n'
            '  \"alternative_text\": "Förbättrad version på ungefär samma längd som original, med samma struktur men förbättrad enligt förslagen."\n'
            "}\n\n"
            f"ORIGINAL TEXT ({word_count} ord):\n" + text + "\n\n"
            "Returnera ENDAST JSON-objektet, inget annat."
        )

    async def analyze_text(self, text: str, temperature: float = 0.7) -> tuple[list[str], Tone, str]:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": self._build_prompt(text)},
            ],
            "temperature": temperature,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        attempt = 0
        while attempt < MAX_RETRIES:
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
                    resp = await client.post(self.base_url, json=payload, headers=headers)
                    if resp.status_code >= SERVER_ERROR_CODE:
                        raise httpx.HTTPStatusError(
                            "Server error", request=resp.request, response=resp
                        )
                    resp.raise_for_status()
                    data = resp.json()
                content: str = data["choices"][0]["message"]["content"]
                start = content.find("{")
                end = content.rfind("}")
                if start == -1 or end == -1 or end <= start:
                    short_summary = (text[:150] + "...") if len(text) > 150 else text
                    return [
                        "Förkorta längre meningar",
                        "Använd mer aktiva verb",
                    ], "neutral", short_summary
                fragment = content[start : end + 1]

                parsed = LLMAnalyzeOutput.model_validate_json(fragment)
                suggestions = [s.strip() for s in parsed.suggestions if s.strip()]
                if len(suggestions) < MIN_SUGGESTIONS:
                    suggestions += ["Använd mer aktiva verb", "Förkorta meningarna"]
                suggestions = suggestions[:MAX_SUGGESTIONS]
                return suggestions, parsed.tone, parsed.alternative_text
            except (httpx.TimeoutException, httpx.HTTPStatusError):
                await asyncio.sleep(0.5 * (2**attempt))
                attempt += 1
            except ValidationError as e:
                # Log error men försök återhämta sig
                import logging
                logging.error(f"JSON validation failed: {e}")
                await asyncio.sleep(0.5 * (2**attempt))
                attempt += 1
        # Efter retries
        short_summary = (text[:150] + "...") if len(text) > 150 else text
        return [
            "Förkorta längre meningar",
            "Använd mer aktiva verb",
        ], "neutral", short_summary


    async def generate_text(self, text: str, selected_suggestions: list[str], temperature: float = 0.7) -> str:
        """
        Generera förbättrad text baserat på valda förslag med DeepSeek API.
        
        VIKTIGT: Endast de förslag som är markerade som valda (JA) ska appliceras.
        Alla andra förslag ska ignoreras helt.
        """
        if not selected_suggestions:
            return text
        
        word_count = len(text.split())
        min_words = max(word_count - 50, 50)
        max_words = word_count + 50
        suggestions_str = "\n".join(f"- {s}" for s in selected_suggestions)
        
        prompt = (
            "Du är en erfaren redaktör. Din ENDA uppgift är att tillämpa DESSA redigerings-förslag och INGET ANNAT.\n\n"
            "DESSA FÖRSLAG MÅSTE APPLICERAS:\n"
            f"{suggestions_str}\n\n"
            "KRITISKA INSTRUKTIONER:\n"
            f"1. Tillämpa ENDAST de förslag som listas ovan - IGNORERA alla andra möjliga förbättringar\n"
            f"2. Returnerad text MÅSTE vara mellan {min_words}-{max_words} ord (original: {word_count} ord)\n"
            "3. Behåll minst 80% av originaltext ordet för ordet\n"
            "4. Gör ENDAST minimala, chirurgiska ändringar för dessa specifika förslag\n"
            "5. INTE en sammanfattning - samma längd och struktur som original\n"
            "6. Returnera ENBART den redigerade texten, inget annat\n\n"
            f"ORIGINAL TEXT ({word_count} ord):\n"
            f"{text}\n\n"
            f"Tillämpa ENBART de {len(selected_suggestions)} förslag ovan. Returnera den redigerade texten mellan {min_words}-{max_words} ord."
        )
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a precise editor. Apply ONLY the specific suggestions provided. Ignore all other possible improvements. Make MINIMAL changes. Keep at least 80% of text identical. CRITICAL: The returned text MUST be between the specified word count range. Never summarize - edit only to apply the given suggestions."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        attempt = 0
        while attempt < MAX_RETRIES:
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
                    resp = await client.post(self.base_url, json=payload, headers=headers)
                    if resp.status_code >= SERVER_ERROR_CODE:
                        raise httpx.HTTPStatusError(
                            "Server error", request=resp.request, response=resp
                        )
                    resp.raise_for_status()
                    data = resp.json()
                    generated = data["choices"][0]["message"]["content"].strip()
                    
                    # Validera längden
                    gen_words = len(generated.split())
                    if min_words <= gen_words <= max_words:
                        return generated
                    else:
                        # Om DeepSeek inte respekterar längd, försök igen
                        attempt += 1
                        await asyncio.sleep(0.5 * (2**attempt))
            except (httpx.TimeoutException, httpx.HTTPStatusError):
                await asyncio.sleep(0.5 * (2**attempt))
                attempt += 1
            except Exception as e:
                import logging
                logging.error(f"Generation error: {e}")
                await asyncio.sleep(0.5 * (2**attempt))
                attempt += 1

        # Fallback: returnera original om allt misslyckas
        return text


def get_analyzer() -> DeepSeekAnalyzer:
    return DeepSeekAnalyzer(settings.deepseek_api_key)

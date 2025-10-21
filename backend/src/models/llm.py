from typing import Literal

from pydantic import BaseModel

Tone = Literal["positive", "neutral", "negative"]


class LLMAnalyzeOutput(BaseModel):
    suggestions: list[str]
    tone: Tone
    alternative_text: str

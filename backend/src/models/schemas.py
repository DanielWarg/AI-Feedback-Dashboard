from typing import Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class AnalyzeResponse(BaseModel):
    suggestions: list[str] = Field(..., min_length=2, max_length=3)
    tone: Literal["positive", "neutral", "negative"]
    alternative_text: str


class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    suggestions: list[str] = Field(..., min_length=1)
    selected_suggestions: list[bool] = Field(...)  # [True, False, True] = vilka förslag som ska appliceras
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class GenerateResponse(BaseModel):
    generated_text: str

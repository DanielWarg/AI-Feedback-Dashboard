from fastapi import APIRouter, HTTPException, Request

from ..models.schemas import AnalyzeRequest, AnalyzeResponse, GenerateRequest, GenerateResponse
from ..services.analyzer import get_analyzer
from ..utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, request: Request) -> AnalyzeResponse:
    cid = getattr(request.state, "correlation_id", "unknown")
    text = req.text.strip()
    if not text:
        logger.warning("Empty text received", extra={"correlation_id": cid})
        raise HTTPException(status_code=400, detail="Text may not be empty")

    analyzer = get_analyzer()
    suggestions, tone, alternative_text = await analyzer.analyze_text(text, temperature=req.temperature)
    if not suggestions:
        logger.error("No suggestions from analyzer", extra={"correlation_id": cid})
        raise HTTPException(status_code=500, detail="Analyzer returned no suggestions")

    logger.info(
        "Analysis successful",
        extra={"correlation_id": cid, "tone": tone, "suggestions_count": len(suggestions)},
    )
    return AnalyzeResponse(suggestions=suggestions[:3], tone=tone, alternative_text=alternative_text)


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, request: Request) -> GenerateResponse:
    cid = getattr(request.state, "correlation_id", "unknown")
    text = req.text.strip()
    if not text:
        logger.warning("Empty text received in generate", extra={"correlation_id": cid})
        raise HTTPException(status_code=400, detail="Text may not be empty")

    # Filtrera valda förslag
    selected = [s for s, selected in zip(req.suggestions, req.selected_suggestions, strict=True) if selected]
    if not selected:
        logger.warning("No suggestions selected", extra={"correlation_id": cid})
        raise HTTPException(status_code=400, detail="At least one suggestion must be selected")

    analyzer = get_analyzer()
    generated_text = await analyzer.generate_text(text, selected, temperature=req.temperature)

    logger.info(
        "Generation successful",
        extra={"correlation_id": cid, "selected_count": len(selected)},
    )
    return GenerateResponse(generated_text=generated_text)

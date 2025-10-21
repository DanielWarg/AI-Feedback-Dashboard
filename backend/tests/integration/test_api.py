from fastapi.testclient import TestClient
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.main import app

client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_analyze_empty_text_422():
    """Tom text returnerar 422 (Pydantic validation error)"""
    r = client.post("/analyze", json={"text": ""})
    assert r.status_code == 422


def test_analyze_valid_returns_structure():
    r = client.post("/analyze", json={"text": "Detta är ett test."})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("suggestions"), list)
    assert data.get("tone") in {"positive", "neutral", "negative"}
    assert 2 <= len(data["suggestions"]) <= 3
    assert isinstance(data.get("alternative_text"), str)
    assert len(data["alternative_text"]) > 0


def test_analyze_tone_in_valid_enum():
    """Tone måste vara en av tre giltiga värden."""
    r = client.post("/analyze", json={"text": "En längre text för att få en analys."})
    assert r.status_code == 200
    data = r.json()
    assert data["tone"] in {"positive", "neutral", "negative"}


def test_analyze_error_response_structure():
    """Felresponser ska ha konsekvent struktur."""
    r = client.post("/analyze", json={"text": ""})
    assert r.status_code == 422
    data = r.json()
    assert "detail" in data


def test_analyze_with_temperature():
    """Temperature-parametern ska accepteras och påverka resultat."""
    text = "En test text som vi analyserar med olika temperaturer."
    
    # Test with conservative temperature
    r_conservative = client.post("/analyze", json={"text": text, "temperature": 0.3})
    assert r_conservative.status_code == 200
    
    # Test with creative temperature
    r_creative = client.post("/analyze", json={"text": text, "temperature": 1.5})
    assert r_creative.status_code == 200
    
    # Båda ska ha samma struktur
    for r in [r_conservative, r_creative]:
        data = r.json()
        assert "suggestions" in data
        assert "tone" in data
        assert "alternative_text" in data


def test_generate_with_selected_suggestions():
    """Test /generate endpoint med valda förslag."""
    text = "En test text med flera meningar som kan förbättras på olika sätt här."
    suggestions = [
        "Förkorta meningarna",
        "Använd aktivare språk",
        "Förtydliga budskapet"
    ]
    selected = [True, False, True]  # Välj förslag 1 och 3
    
    r = client.post("/generate", json={
        "text": text,
        "suggestions": suggestions,
        "selected_suggestions": selected,
        "temperature": 0.7
    })
    assert r.status_code == 200
    data = r.json()
    assert "generated_text" in data
    assert isinstance(data["generated_text"], str)
    assert len(data["generated_text"]) > 0


def test_generate_no_selection_fails():
    """Test /generate utan valda förslag returnerar fel."""
    r = client.post("/generate", json={
        "text": "Test text",
        "suggestions": ["Förslag 1"],
        "selected_suggestions": [False],
        "temperature": 0.7
    })
    assert r.status_code == 400

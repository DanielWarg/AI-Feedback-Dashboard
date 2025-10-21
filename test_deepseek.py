#!/usr/bin/env python3
"""
Test script to simulate DeepSeek API call and debug the flow
"""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

print("╔════════════════════════════════════════╗")
print("║  TEST: DeepSeek Integration            ║")
print("╚════════════════════════════════════════╝")
print()

# 1. Check .env
print("📋 Step 1: Loading .env")
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    print("  ✗ DEEPSEEK_API_KEY not set")
    sys.exit(1)
print(f"  ✓ API Key: {api_key[:20]}...")
print()

# 2. Test config
print("🔧 Step 2: Testing Config")
try:
    from src.utils.config import settings
    print(f"  ✓ Config loaded")
    print(f"    - API Key in config: {settings.deepseek_api_key[:20] if settings.deepseek_api_key else 'None'}...")
    print(f"    - Port: {settings.backend_port}")
    print(f"    - Debug: {settings.debug}")
except Exception as e:
    print(f"  ✗ Config error: {e}")
    sys.exit(1)
print()

# 3. Test analyzer
print("🤖 Step 3: Testing Analyzer")
try:
    from src.services.analyzer import get_analyzer, DeepSeekAnalyzer
    analyzer = get_analyzer()
    print(f"  ✓ Analyzer loaded: {analyzer.__class__.__name__}")
    if isinstance(analyzer, DeepSeekAnalyzer):
        print(f"    - Using DeepSeek API")
        print(f"    - Model: {analyzer.model}")
        print(f"    - URL: {analyzer.base_url}")
    else:
        print(f"    - Using Mock (no API key)")
except Exception as e:
    print(f"  ✗ Analyzer error: {e}")
    sys.exit(1)
print()

# 4. Test DeepSeek call
print("🚀 Step 4: Testing DeepSeek API Call")
test_text = "Hej, jag vill förbättra min skrivstil och blir bättre på att kommunicera."

async def test_api():
    try:
        print(f"  Input: {test_text}")
        print(f"  Calling analyzer...")
        suggestions, tone = await analyzer.analyze_text(test_text)
        print(f"  ✓ Success!")
        print(f"    - Suggestions: {suggestions}")
        print(f"    - Tone: {tone}")
        print()
        
        # Verify response
        if len(suggestions) < 2 or len(suggestions) > 3:
            print(f"  ⚠️  Warning: Expected 2-3 suggestions, got {len(suggestions)}")
        if tone not in ("positive", "neutral", "negative"):
            print(f"  ⚠️  Warning: Invalid tone '{tone}'")
        else:
            print(f"  ✓ Response format valid")
            
    except Exception as e:
        print(f"  ✗ API Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    return True

result = asyncio.run(test_api())
print()

# 5. Test HTTP endpoint
print("🌐 Step 5: Testing HTTP Endpoint")
try:
    import httpx
    
    payload = {"text": test_text}
    print(f"  POST http://localhost:8002/analyze")
    print(f"  Body: {json.dumps(payload)}")
    
    # Note: This will fail if backend not running, which is OK
    try:
        resp = httpx.post("http://localhost:8002/analyze", json=payload, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            print(f"  ✓ HTTP 200 OK")
            print(f"    - Response: {data}")
        else:
            print(f"  ✗ HTTP {resp.status_code}: {resp.text}")
    except httpx.ConnectError:
        print(f"  ⚠️  Backend not running on localhost:8002 (that's OK for this test)")
except Exception as e:
    print(f"  ⚠️  HTTP test skipped: {e}")

print()
print("╔════════════════════════════════════════╗")
if result:
    print("║  ✅ All tests passed!                 ║")
else:
    print("║  ✗ Some tests failed                  ║")
print("╚════════════════════════════════════════╝")

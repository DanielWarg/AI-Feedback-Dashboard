#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║  DEBUG: AI Feedback Dashboard         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 1. Check .env
echo "📋 Step 1: Checking .env"
if [ -f .env ]; then
  echo "  ✓ .env exists"
  DEEPSEEK_KEY=$(grep "DEEPSEEK_API_KEY" .env | cut -d'=' -f2)
  if [ -z "$DEEPSEEK_KEY" ]; then
    echo "  ⚠️  DEEPSEEK_API_KEY is empty (using Mock)"
  else
    echo "  ✓ DEEPSEEK_API_KEY is set: ${DEEPSEEK_KEY:0:20}..."
  fi
else
  echo "  ✗ .env NOT FOUND - create it with API key"
  exit 1
fi
echo ""

# 2. Check Backend
echo "🔧 Step 2: Checking Backend"
cd backend
if [ -d ".venv" ]; then
  echo "  ✓ .venv exists"
else
  echo "  ✗ .venv missing - creating..."
  python3 -m venv .venv
fi

source .venv/bin/activate
if python -c "import fastapi" 2>/dev/null; then
  echo "  ✓ Dependencies OK"
else
  echo "  ⚠️  Installing dependencies..."
  pip install -q -r requirements.txt
fi

# Test import
if python -c "from src.utils.config import settings; print(f'  ✓ Config loaded: API={\"yes\" if settings.deepseek_api_key else \"no (Mock)\"}; Port={settings.backend_port}')" 2>/dev/null; then
  :
else
  echo "  ✗ Config import failed"
fi
echo ""

# 3. Check Frontend
echo "📱 Step 3: Checking Frontend"
cd ../frontend
if [ -d "node_modules" ]; then
  echo "  ✓ node_modules exists"
else
  echo "  ⚠️  Installing dependencies..."
  npm install -q
fi

if [ -f "vite.config.ts" ]; then
  echo "  ✓ Vite config OK"
else
  echo "  ✗ Vite config missing"
fi
echo ""

# 4. Port check
echo "🔌 Step 4: Checking Ports"
for port in 5173 8002; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ⚠️  Port $port already in use"
  else
    echo "  ✓ Port $port available"
  fi
done
echo ""

# 5. Summary
echo "╔════════════════════════════════════════╗"
echo "║  READY TO START?                       ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "✓ Run these commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && source .venv/bin/activate && uvicorn src.main:app --reload --port 8002"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""

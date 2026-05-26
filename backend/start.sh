#!/bin/bash
# Unai Chatbox Backend Startup Script

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV="$BACKEND_DIR/venv"

echo "🚀 Starting Unai Chatbox FastAPI Backend..."

# Create venv if it doesn't exist
if [ ! -d "$VENV" ]; then
  echo "📦 Creating Python virtual environment..."
  python3 -m venv "$VENV"
fi

# Activate venv
source "$VENV/bin/activate"

# Install dependencies if needed
echo "📦 Installing dependencies..."
pip install -r "$BACKEND_DIR/requirements.txt" -q

# Start the server
echo "✅ Starting server at http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

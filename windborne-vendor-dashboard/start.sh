#!/bin/bash

# WindBorne Systems Vendor Health Dashboard - Quick Start Script

echo "🚀 Starting WindBorne Systems Vendor Health Dashboard"
echo "=" | tr '\n' '\n'; printf "%0.s=" {1..60}; echo

# Check if API key is set
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found"
    echo "Please copy backend/env.example to backend/.env and add your Alpha Vantage API key"
    exit 1
fi

# Check if API key is configured
if ! grep -q "ALPHA_VANTAGE_API_KEY=.*[^=]" backend/.env; then
    echo "❌ Error: ALPHA_VANTAGE_API_KEY not configured in backend/.env"
    echo "Please add your Alpha Vantage API key to backend/.env"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Error: Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Error: npm is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend
echo "🐍 Starting Python backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/pyvenv.cfg" ] || [ requirements.txt -nt venv/pyvenv.cfg ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start backend in background
echo "🚀 Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "📦 Starting React frontend..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting Vite development server..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 Dashboard is starting up!"
echo "📊 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for background processes
wait

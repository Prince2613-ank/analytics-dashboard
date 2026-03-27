#!/bin/bash

echo "🚀 Starting Analytics Dashboard..."
echo ""

# Start backend in background
echo "Starting Backend on http://localhost:8000..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "Starting Frontend on http://localhost:5173..."
cd frontend
npm run dev
cd ..

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT

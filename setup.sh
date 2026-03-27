#!/bin/bash

echo "🚀 Analytics Dashboard - Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python from https://python.org/"
    exit 1
fi

echo "✅ Prerequisites found"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
pip install -r requirements.txt
cd ..
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install
cd ..
echo "✅ Frontend setup complete"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start Backend:  cd backend && python main.py"
echo "2. Start Frontend: cd frontend && npm run dev"
echo ""
echo "Then visit http://localhost:5173"

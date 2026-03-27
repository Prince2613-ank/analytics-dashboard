@echo off
echo 🚀 Analytics Dashboard - Setup Script (Windows)
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo    Please install from https://nodejs.org/
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo    Please install from https://python.org/
    exit /b 1
)

echo ✅ Prerequisites found
echo.

echo 📦 Setting up Backend...
cd backend
pip install -r requirements.txt
cd ..
echo ✅ Backend setup complete
echo.

echo 📦 Setting up Frontend...
cd frontend
call npm install
cd ..
echo ✅ Frontend setup complete
echo.

echo 🎉 Setup complete!
echo.
echo To start the application:
echo.
echo Option 1 - Using separate terminals:
echo   Terminal 1: cd backend ^& python main.py
echo   Terminal 2: cd frontend ^& npm run dev
echo.
echo Option 2 - Quick start:
echo   - Run: start-dev.bat
echo.
echo Then visit http://localhost:5173

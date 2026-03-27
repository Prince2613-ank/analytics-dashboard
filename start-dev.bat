@echo off
echo 🚀 Starting Analytics Dashboard...
echo.

echo Starting Backend on http://localhost:8000...
start cmd /k "cd backend && python main.py"

timeout /t 2 /nobreak

echo Starting Frontend on http://localhost:5173...
cd frontend
call npm run dev

@echo off
echo.
echo ==========================================
echo   Lost & Found App - Quick Start
echo ==========================================
echo.

:: Check if dependencies are installed
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed
    echo Please run setup.bat first
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not installed  
    echo Please run setup.bat first
    pause
    exit /b 1
)

:: Check if backend .env exists
if not exist "backend\.env" (
    echo [WARNING] Backend .env file not found
    echo Creating basic .env file...
    echo NODE_ENV=development > backend\.env
    echo PORT=5000 >> backend\.env
    echo MONGODB_URI=mongodb://localhost:27017/lostfound >> backend\.env
    echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789 >> backend\.env
    echo JWT_EXPIRES_IN=30d >> backend\.env
    echo FRONTEND_URL=http://localhost:3001 >> backend\.env
    echo [OK] Basic .env file created
    echo Please edit backend\.env with your actual configuration
    echo.
)

echo Starting Lost & Found Application...
echo.
echo Opening two terminals:
echo - Terminal 1: Backend Server (http://localhost:5000)
echo - Terminal 2: Frontend Server (http://localhost:3001)
echo.

:: Start backend in new terminal
start "Lost & Found - Backend Server" cmd /k "cd backend && echo Starting Backend Server... && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in new terminal
start "Lost & Found - Frontend Server" cmd /k "cd frontend && echo Starting Frontend Server... && npm start"

echo.
echo ==========================================
echo   Servers Starting...
echo ==========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:5000/api
echo.
echo Press any key to close this window...
pause >nul

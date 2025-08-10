@echo off
echo.
echo ==========================================
echo   Lost & Found App - Environment Setup
echo ==========================================
echo.

echo Checking Prerequisites...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed
    node --version
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available
    pause
    exit /b 1
) else (
    echo [OK] npm is available
    npm --version
)

echo.
echo Installing Dependencies...
echo.

:: Install Frontend Dependencies
echo [1/2] Installing Frontend Dependencies...
cd frontend
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    ) else (
        echo [OK] Frontend dependencies installed successfully
    )
) else (
    echo [ERROR] Frontend package.json not found
    pause
    exit /b 1
)

:: Install Backend Dependencies
echo.
echo [2/2] Installing Backend Dependencies...
cd ..\backend
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    ) else (
        echo [OK] Backend dependencies installed successfully
    )
) else (
    echo [ERROR] Backend package.json not found
    pause
    exit /b 1
)

:: Go back to root directory
cd ..

echo.
echo ==========================================
echo   Environment Setup Complete!
echo ==========================================
echo.
echo Next Steps:
echo 1. Configure your backend .env file (see SETUP_GUIDE.md)
echo 2. Set up MongoDB (local or Atlas)
echo 3. Run the application:
echo.
echo    Frontend: cd frontend && npm start
echo    Backend:  cd backend && npm run dev
echo.
echo For detailed setup instructions, see SETUP_GUIDE.md
echo.
pause

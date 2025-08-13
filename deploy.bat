@echo off
REM 🚀 QUICK DEPLOYMENT SCRIPT FOR LOST & FOUND APP (Windows)
REM This script helps you deploy your app quickly to Vercel + Supabase

echo 🚀 Lost ^& Found App - Quick Deployment
echo ======================================

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM is required but not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is required but not installed. Please install Git first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Build the application
echo.
echo 🔨 Building application...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo 🎉 APPLICATION READY FOR DEPLOYMENT!
echo.
echo 📋 NEXT STEPS:
echo 1. Set up Supabase database:
echo    • Go to https://supabase.com
echo    • Create new project
echo    • Run the SQL script in database-setup.sql
echo.
echo 2. Deploy to Vercel:
echo    • Go to https://vercel.com
echo    • Import this GitHub repository
echo    • Add environment variables:
echo      - REACT_APP_SUPABASE_URL
echo      - REACT_APP_SUPABASE_ANON_KEY
echo      - JWT_SECRET
echo.
echo 3. Test your deployment:
echo    • Visit your Vercel URL
echo    • Login with: admin@college.edu / admin123
echo    • Test all features
echo.
echo 💡 Need help? Check FULL_HOSTING_GUIDE.md for detailed instructions
echo.
echo 🎯 Your Lost ^& Found app will be live in ~5 minutes!
echo.
pause

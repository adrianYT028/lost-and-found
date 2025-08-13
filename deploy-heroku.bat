@echo off
REM 🚀 HEROKU DEPLOYMENT SCRIPT - Lost & Found App
REM Automated deployment to Heroku with Supabase database

echo 🚀 Lost ^& Found App - Heroku Deployment
echo ==========================================

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI is required but not installed.
    echo 📥 Please install from: https://devcenter.heroku.com/articles/heroku-cli
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

REM Check if user is logged into Heroku
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Heroku first:
    heroku login
    if %errorlevel% neq 0 (
        echo ❌ Heroku login failed
        pause
        exit /b 1
    )
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ NPM install failed! Please check the errors above.
    pause
    exit /b 1
)

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
echo 🌐 Creating Heroku app...
set /p APP_NAME="Enter your app name (or press Enter for auto-generated): "
if "%APP_NAME%"=="" (
    heroku create
) else (
    heroku create %APP_NAME%
)

if %errorlevel% neq 0 (
    echo ⚠️  App creation failed - app name might be taken or invalid
    echo ℹ️  Continuing with existing app configuration...
)

echo.
echo ⚙️  ENVIRONMENT VARIABLES SETUP
echo ================================
echo.
echo 📋 You need to set up your Supabase credentials:
echo 1. Go to https://supabase.com and create/access your project
echo 2. Get your Project URL and Anon Key from Settings ^> API
echo 3. Enter them below:
echo.

set /p SUPABASE_URL="Enter your Supabase URL: "
set /p SUPABASE_ANON_KEY="Enter your Supabase Anon Key: "
set /p JWT_SECRET="Enter a JWT secret (or press Enter for auto-generated): "

if "%JWT_SECRET%"=="" (
    set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
)

echo.
echo 🔧 Setting environment variables...
heroku config:set REACT_APP_SUPABASE_URL=%SUPABASE_URL%
heroku config:set REACT_APP_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
heroku config:set JWT_SECRET=%JWT_SECRET%
heroku config:set NODE_ENV=production

echo.
echo 📡 Deploying to Heroku...
git add .
git commit -m "Deploy Lost & Found app to Heroku"
git push heroku master

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo.
    echo 🎉 YOUR APP IS LIVE!
    echo ===================
    echo.
    echo 🌐 Opening your app...
    heroku open
    echo.
    echo 📊 App Information:
    heroku info
    echo.
    echo 📋 POST-DEPLOYMENT CHECKLIST:
    echo =============================
    echo ✅ Set up database: Run database-setup.sql in Supabase SQL Editor
    echo ✅ Test login: admin@college.edu / admin123
    echo ✅ Test user registration
    echo ✅ Test posting items
    echo ✅ Verify admin dashboard access
    echo.
    echo 🔗 Useful commands:
    echo • View logs: heroku logs --tail
    echo • Restart app: heroku restart
    echo • Open app: heroku open
    echo • Check config: heroku config
    echo.
    echo 💡 Need help? Check HEROKU_DEPLOYMENT_GUIDE.md
) else (
    echo ❌ Deployment failed! 
    echo.
    echo 🔍 Troubleshooting steps:
    echo 1. Check logs: heroku logs --tail
    echo 2. Verify all environment variables: heroku config
    echo 3. Try manual deployment: git push heroku master
    echo 4. Check HEROKU_DEPLOYMENT_GUIDE.md for detailed help
)

echo.
pause

#!/bin/bash

# 🚀 HEROKU DEPLOYMENT SCRIPT - Lost & Found App
# Automated deployment to Heroku with Supabase database

echo "🚀 Lost & Found App - Heroku Deployment"
echo "========================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is required but not installed."
    echo "📥 Please install from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is required but not installed. Please install Git first."
    exit 1
fi

# Check if user is logged into Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    heroku login
    if [ $? -ne 0 ]; then
        echo "❌ Heroku login failed"
        exit 1
    fi
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ NPM install failed! Please check the errors above."
    exit 1
fi

# Build the application
echo ""
echo "🔨 Building application..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo ""
echo "🌐 Creating Heroku app..."
read -p "Enter your app name (or press Enter for auto-generated): " APP_NAME
if [ -z "$APP_NAME" ]; then
    heroku create
else
    heroku create "$APP_NAME"
fi

if [ $? -ne 0 ]; then
    echo "⚠️  App creation failed - app name might be taken or invalid"
    echo "ℹ️  Continuing with existing app configuration..."
fi

echo ""
echo "⚙️  ENVIRONMENT VARIABLES SETUP"
echo "================================"
echo ""
echo "📋 You need to set up your Supabase credentials:"
echo "1. Go to https://supabase.com and create/access your project"
echo "2. Get your Project URL and Anon Key from Settings > API"
echo "3. Enter them below:"
echo ""

read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Enter a JWT secret (or press Enter for auto-generated): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
fi

echo ""
echo "🔧 Setting environment variables..."
heroku config:set REACT_APP_SUPABASE_URL="$SUPABASE_URL"
heroku config:set REACT_APP_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
heroku config:set JWT_SECRET="$JWT_SECRET"
heroku config:set NODE_ENV=production

echo ""
echo "📡 Deploying to Heroku..."
git add .
git commit -m "Deploy Lost & Found app to Heroku"
git push heroku master

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 YOUR APP IS LIVE!"
    echo "==================="
    echo ""
    echo "🌐 Opening your app..."
    heroku open
    echo ""
    echo "📊 App Information:"
    heroku info
    echo ""
    echo "📋 POST-DEPLOYMENT CHECKLIST:"
    echo "============================="
    echo "✅ Set up database: Run database-setup.sql in Supabase SQL Editor"
    echo "✅ Test login: admin@college.edu / admin123"
    echo "✅ Test user registration"
    echo "✅ Test posting items"
    echo "✅ Verify admin dashboard access"
    echo ""
    echo "🔗 Useful commands:"
    echo "• View logs: heroku logs --tail"
    echo "• Restart app: heroku restart"
    echo "• Open app: heroku open"
    echo "• Check config: heroku config"
    echo ""
    echo "💡 Need help? Check HEROKU_DEPLOYMENT_GUIDE.md"
else
    echo "❌ Deployment failed!"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check logs: heroku logs --tail"
    echo "2. Verify all environment variables: heroku config"
    echo "3. Try manual deployment: git push heroku master"
    echo "4. Check HEROKU_DEPLOYMENT_GUIDE.md for detailed help"
fi

echo ""
read -p "Press Enter to continue..."

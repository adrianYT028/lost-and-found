#!/bin/bash

# 🚀 QUICK DEPLOYMENT SCRIPT FOR LOST & FOUND APP
# This script helps you deploy your app quickly to Vercel + Supabase

echo "🚀 Lost & Found App - Quick Deployment"
echo "======================================"

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { echo "❌ NPM is required but not installed. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

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
echo "🎉 APPLICATION READY FOR DEPLOYMENT!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Set up Supabase database:"
echo "   • Go to https://supabase.com"
echo "   • Create new project"
echo "   • Run the SQL script in database-setup.sql"
echo ""
echo "2. Deploy to Vercel:"
echo "   • Go to https://vercel.com"
echo "   • Import this GitHub repository"
echo "   • Add environment variables:"
echo "     - REACT_APP_SUPABASE_URL"
echo "     - REACT_APP_SUPABASE_ANON_KEY"
echo "     - JWT_SECRET"
echo ""
echo "3. Test your deployment:"
echo "   • Visit your Vercel URL"
echo "   • Login with: admin@college.edu / admin123"
echo "   • Test all features"
echo ""
echo "💡 Need help? Check FULL_HOSTING_GUIDE.md for detailed instructions"
echo ""
echo "🎯 Your Lost & Found app will be live in ~5 minutes!"

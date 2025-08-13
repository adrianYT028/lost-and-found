# 🚀 Azure Static Web Apps Deployment Guide

## Overview
This guide will help you deploy your Lost & Found application to Azure Static Web Apps with GitHub Actions for CI/CD.

## Prerequisites
- ✅ Azure Account (free tier available)
- ✅ GitHub repository (already set up)
- ✅ Supabase database (already configured)

## Step-by-Step Deployment

### 1. Create Azure Static Web App

1. **Go to Azure Portal**: https://portal.azure.com
2. **Sign in** with your Microsoft account
3. **Click "Create a resource"** (+ icon)
4. **Search for "Static Web Apps"** and select it
5. **Click "Create"**

### 2. Configure Basic Settings

```
Subscription: [Select your subscription]
Resource Group: [Create new] "lost-found-rg"
Name: "lost-found-app"
Plan type: Free (perfect for development/testing)
Region: Central US (or closest to your location)
```

### 3. Configure Deployment Source

```
Source: GitHub
Organization: adrianYT028
Repository: lost-and-found
Branch: master
```

### 4. Build Configuration

```
Build Presets: React
App location: /
API location: azure-functions
Output location: build
```

### 5. Review and Create

- Click **"Review + Create"**
- Verify all settings
- Click **"Create"**
- Wait for deployment (2-3 minutes)

### 6. Configure Environment Variables

1. **Navigate to your Static Web App** in Azure Portal
2. **Go to "Configuration"** in the left menu
3. **Click "Application settings"**
4. **Add the following settings**:

```
Name: REACT_APP_SUPABASE_URL
Value: [Your Supabase URL]

Name: REACT_APP_SUPABASE_ANON_KEY  
Value: [Your Supabase Anon Key]

Name: JWT_SECRET
Value: [Your JWT Secret - generate a random 32+ character string]
```

5. **Click "Save"**

### 7. Get API Token for GitHub

1. **In your Static Web App**, go to **"Overview"**
2. **Click "Manage deployment token"**
3. **Copy the token** (you'll need this for GitHub)

### 8. Configure GitHub Secrets

1. **Go to**: https://github.com/adrianYT028/lost-and-found
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add these secrets**:

```
AZURE_STATIC_WEB_APPS_API_TOKEN = [Token from Azure]
REACT_APP_SUPABASE_URL = [Your Supabase URL]
REACT_APP_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
JWT_SECRET = [Your JWT Secret]
```

### 9. Trigger Deployment

The deployment will trigger automatically when you push to the master branch. You can also manually trigger it:

1. **Go to your GitHub repository**
2. **Actions tab**
3. **Click "Azure Static Web Apps CI/CD"**
4. **Click "Run workflow"**

### 10. Monitor Deployment

1. **In GitHub**: Watch the Actions tab for build progress
2. **In Azure**: Monitor in Static Web Apps → "Functions" and "Overview"

## 🎉 Your App Will Be Available At:

```
https://[your-app-name].[random-string].azurestaticapps.net
```

You can find the exact URL in Azure Portal → Static Web Apps → Overview → URL

## Features Enabled

✅ **Automatic CI/CD** - Push to GitHub triggers deployment
✅ **Global CDN** - Fast loading worldwide  
✅ **HTTPS** - Automatic SSL certificate
✅ **Custom Domain** - Can add your own domain
✅ **API Functions** - Serverless backend
✅ **Authentication** - Built-in auth providers (if needed)
✅ **Staging Environments** - Preview branches automatically

## Security Features Deployed

✅ **Found Items Hidden** - Only admins can see found items
✅ **Admin-Only Access** - Special endpoints for administrators
✅ **JWT Authentication** - Secure user sessions
✅ **CORS Protection** - Proper cross-origin setup

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify environment variables are set
- Check for syntax errors in code

### API Functions Not Working  
- Verify azure-functions folder structure
- Check environment variables in Azure
- Monitor Azure Functions logs

### 404 Errors
- Check staticwebapp.config.json routing
- Verify build output directory is "build"
- Check navigation fallback configuration

## Cost
- **Free Tier**: 100GB bandwidth, 2 custom domains
- **Perfect for**: Development, small apps, portfolios
- **Scales**: Automatically with usage

## Next Steps After Deployment

1. **Test all features** on the Azure URL
2. **Set up custom domain** (optional)
3. **Configure monitoring** and alerts
4. **Set up staging environments** for testing

## Support

- **Azure Docs**: https://docs.microsoft.com/azure/static-web-apps/
- **GitHub Actions**: https://docs.github.com/actions
- **Troubleshooting**: Check Azure Portal logs and GitHub Actions

---

Your Lost & Found application is now ready for Azure deployment! 🚀

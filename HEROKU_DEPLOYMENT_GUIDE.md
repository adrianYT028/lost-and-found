# 🚀 HEROKU DEPLOYMENT GUIDE - Lost & Found App

## 📋 Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Make sure your code is in a Git repository
4. **Supabase Database**: Set up your database (see Database Setup section)

## 🎯 Quick Deploy (5 minutes)

### Step 1: Install Heroku CLI and Login
```bash
# Install Heroku CLI (if not already installed)
# Windows: Download from heroku.com/cli
# Mac: brew install heroku/brew/heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login
```

### Step 2: Create Heroku App
```bash
# Navigate to your project directory
cd "c:\Users\karti\OneDrive\Desktop\lost and found\lost-and-found-app"

# Create Heroku app (replace 'your-app-name' with desired name)
heroku create your-lost-found-app

# Or let Heroku generate a name
heroku create
```

### Step 3: Set Environment Variables
```bash
# Set your Supabase credentials
heroku config:set REACT_APP_SUPABASE_URL=your_supabase_url
heroku config:set REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
heroku config:set JWT_SECRET=your_jwt_secret_key

# Optional: Set Node.js version
heroku config:set NODE_ENV=production
```

### Step 4: Deploy to Heroku
```bash
# Add Heroku remote (if not already added)
heroku git:remote -a your-app-name

# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku master

# Or if you're on main branch
git push heroku main
```

### Step 5: Open Your App
```bash
# Open your deployed app
heroku open
```

## 🗄️ Database Setup (Supabase)

### Option 1: Use Existing Supabase Project
If you already have a Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and Anon Key
4. Set them as Heroku config vars:
```bash
heroku config:set REACT_APP_SUPABASE_URL=https://your-project.supabase.co
heroku config:set REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com) and create new project
2. Wait for project to be ready (2-3 minutes)
3. Go to SQL Editor and run the database setup script:

```sql
-- Copy the contents of database-setup.sql and run in Supabase SQL Editor
-- This creates all tables, sample data, and admin accounts
```

4. Set environment variables as shown above

## ⚙️ Environment Variables Reference

```bash
# Required for Supabase integration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Required for JWT authentication
JWT_SECRET=your-super-secret-jwt-key

# Optional
NODE_ENV=production
```

## 🔧 Troubleshooting

### Build Failures
```bash
# Check build logs
heroku logs --tail

# Common fixes:
# 1. Make sure all dependencies are in package.json
# 2. Check Node.js version compatibility
heroku config:set NODE_VERSION=18.x

# 3. Clear build cache
heroku plugins:install heroku-repo
heroku repo:purge_cache -a your-app-name
```

### Runtime Errors
```bash
# Check app logs
heroku logs --tail

# Restart the app
heroku restart

# Scale to ensure app is running
heroku ps:scale web=1
```

### Database Connection Issues
```bash
# Verify environment variables
heroku config

# Test database connection in Supabase dashboard
# Ensure RLS policies are configured correctly
```

## 🎉 Post-Deployment Checklist

### ✅ Test Core Features
1. **Homepage loads** - Visit your Heroku URL
2. **User registration** - Create new account
3. **Login works** - Test with test credentials
4. **Post items** - Try posting lost/found items
5. **Admin access** - Login with admin@college.edu / admin123
6. **Database queries** - Browse items, search functionality

### ✅ Admin Account Setup
Your app comes with a pre-configured admin account:
- **Email**: admin@college.edu
- **Password**: admin123
- **Role**: Administrator

Login with these credentials to access admin features.

### ✅ Security Configuration
- Environment variables are set securely in Heroku
- Database has Row Level Security enabled
- Found items are hidden from public view
- Only admins can see and manage found items

## 🌟 Heroku-Specific Features

### Automatic Deployments
Set up automatic deployments from GitHub:
1. Go to your Heroku app dashboard
2. Navigate to Deploy tab
3. Connect to GitHub repository
4. Enable automatic deployments from master/main branch

### Custom Domain
Add your own domain:
```bash
# Add custom domain
heroku domains:add www.yourdomain.com

# Configure DNS with your domain provider
# Point CNAME to your-app-name.herokuapp.com
```

### Performance Monitoring
```bash
# Install New Relic add-on (free tier available)
heroku addons:create newrelic:wayne

# View metrics
heroku addons:open newrelic
```

## 💰 Cost Optimization

### Free Tier Usage
- **Dynos**: 550-1000 free hours per month
- **Database**: Use Supabase free tier (500MB, 50MB database)
- **Bandwidth**: Generous free limits

### Prevent App Sleep
Free dynos sleep after 30 minutes of inactivity:
```bash
# Use a service like uptimerobot.com to ping your app
# Or upgrade to hobby dyno ($7/month) for 24/7 uptime
heroku ps:type web=hobby
```

## 🔄 Updates and Maintenance

### Deploy Updates
```bash
# Make your changes
git add .
git commit -m "Update features"
git push heroku master
```

### Database Migrations
```bash
# Run new SQL migrations in Supabase dashboard
# Environment variables persist across deployments
```

### Backup Strategy
- Supabase automatically handles database backups
- Keep your code in GitHub for version control
- Export important data periodically through admin panel

## 🎯 Success Metrics

After deployment, your Lost & Found app should have:
- ✅ **Fast loading** - Sub-3 second page loads
- ✅ **Secure authentication** - JWT-based with Supabase
- ✅ **Role-based access** - Admin vs regular user features  
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Search functionality** - Fast item discovery
- ✅ **Real-time updates** - Instant notifications
- ✅ **Admin dashboard** - Complete management interface

## 🆘 Need Help?

### Heroku Resources
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Getting Started with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)

### Common Commands
```bash
# View app info
heroku info

# Open app in browser  
heroku open

# View logs
heroku logs --tail

# Run commands on Heroku
heroku run bash

# Scale dynos
heroku ps:scale web=1

# Restart app
heroku restart
```

---

## 🎉 Congratulations!

Your Lost & Found app is now live on Heroku! 🚀

**Your app URL**: `https://your-app-name.herokuapp.com`

Share this URL with your community and start helping people find their lost items! The admin dashboard is available at the same URL - just login with the admin credentials to manage the platform.

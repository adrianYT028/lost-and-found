# 🚀 Complete Lost & Found App Hosting Guide
## Full Production Deployment with Database

This guide covers deploying your Lost & Found application as a complete, production-ready system with database integration.

## 📋 Prerequisites Checklist

### Required Accounts:
- ✅ **GitHub Account** (already have)
- ✅ **Supabase Account** (for database)
- ✅ **Hosting Platform** (choose one):
  - Vercel (recommended - easiest)
  - Azure Static Web Apps
  - Netlify + Serverless Functions
  - Railway (full-stack hosting)
  - DigitalOcean App Platform

### Required Information:
- Database credentials
- Environment variables
- Domain name (optional)

---

## 🗄️ DATABASE SETUP (Supabase)

### Step 1: Create Supabase Project

1. **Go to**: https://supabase.com
2. **Sign up/Login** with GitHub
3. **Create New Project**:
   ```
   Organization: Personal
   Name: lost-found-db
   Database Password: [Generate strong password]
   Region: [Choose closest to your users]
   ```
4. **Wait for setup** (2-3 minutes)

### Step 2: Database Schema Setup

1. **Go to SQL Editor** in Supabase dashboard
2. **Create the database schema**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    studentId VARCHAR(50) UNIQUE,
    phoneNumber VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    isActive BOOLEAN DEFAULT true,
    emailVerified BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE Items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    location VARCHAR(255),
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'closed')),
    userId UUID REFERENCES Users(id) ON DELETE CASCADE,
    contactInfo JSONB, -- Store email, phone as JSON
    dateReported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateFound TIMESTAMP,
    tags TEXT[],
    reward DECIMAL(10,2),
    adminNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table (for AI matching)
CREATE TABLE Matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lostItemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    foundItemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    similarityScore DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmedAt TIMESTAMP,
    rejectedAt TIMESTAMP
);

-- Inquiries table
CREATE TABLE Inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    userId UUID REFERENCES Users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    contactEmail VARCHAR(255) NOT NULL,
    contactPhone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_items_type ON Items(type);
CREATE INDEX idx_items_status ON Items(status);
CREATE INDEX idx_items_category ON Items(category);
CREATE INDEX idx_items_user ON Items(userId);
CREATE INDEX idx_items_created ON Items(createdAt);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_studentid ON Users(studentId);

-- Row Level Security (RLS)
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Items ENABLE ROW LEVEL SECURITY;
ALTER TABLE Matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE Inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON Users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON Users FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view lost items" ON Items FOR SELECT USING (type = 'lost' AND status = 'open');
CREATE POLICY "Admins can view all items" ON Items FOR SELECT USING (
    EXISTS (SELECT 1 FROM Users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create items" ON Items FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Users can update own items" ON Items FOR UPDATE USING (auth.uid() = userId);

-- Add sample data (optional)
INSERT INTO Users (email, password, firstName, lastName, studentId, role) VALUES
('admin@university.edu', '$2b$10$hash_here', 'Admin', 'User', 'ADM001', 'admin'),
('john.doe@student.edu', '$2b$10$hash_here', 'John', 'Doe', 'STU001', 'user');
```

### Step 3: Get Database Credentials

1. **Go to Settings** → **API**
2. **Copy these values**:
   ```
   Project URL: https://your-project.supabase.co
   Anon Key: eyJ... (public key)
   Service Role Key: eyJ... (private key - keep secret)
   ```

---

## 🚀 HOSTING OPTIONS

## Option 1: VERCEL (Recommended - Easiest)

### Why Vercel?
- ✅ **Zero configuration** for React apps
- ✅ **Automatic deployments** from GitHub
- ✅ **Built-in API routes** (serverless functions)
- ✅ **Free tier** with good limits
- ✅ **Global CDN** for fast loading

### Deployment Steps:

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Import your repository**:
   - Click "New Project"
   - Select "adrianYT028/lost-and-found"
   - Click "Import"

4. **Configure Environment Variables**:
   ```
   REACT_APP_SUPABASE_URL = https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = your_anon_key
   JWT_SECRET = your_32_character_secret
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app.vercel.app`

### Configure Custom Domain (Optional):
1. **Buy domain** (from Namecheap, GoDaddy, etc.)
2. **In Vercel**: Settings → Domains
3. **Add your domain**: `yourdomain.com`
4. **Update DNS** at your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

---

## Option 2: AZURE STATIC WEB APPS

### Why Azure?
- ✅ **No serverless function limits**
- ✅ **Built-in authentication**
- ✅ **Microsoft ecosystem**
- ✅ **Free custom domains**

### Deployment Steps:

1. **Create Azure Account**: https://portal.azure.com
2. **Create Static Web App**:
   ```
   Resource Group: lost-found-rg
   Name: lost-found-app
   Region: Central US
   Source: GitHub
   Repository: adrianYT028/lost-and-found
   Branch: master
   Build Preset: React
   App location: /
   API location: azure-functions
   Output location: build
   ```

3. **Configure Environment Variables** in Azure Portal:
   ```
   REACT_APP_SUPABASE_URL = your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY = your_anon_key
   JWT_SECRET = your_jwt_secret
   ```

4. **GitHub Secrets** (automatically added):
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`

---

## Option 3: RAILWAY (Full-Stack Alternative)

### Why Railway?
- ✅ **PostgreSQL included**
- ✅ **Full-stack hosting**
- ✅ **Environment variables**
- ✅ **Automatic deployments**

### Deployment Steps:

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Select repository**: adrianYT028/lost-and-found
5. **Add PostgreSQL**: 
   - Click "Add Service"
   - Select "PostgreSQL"
6. **Configure Environment**:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   JWT_SECRET = your_secret
   PORT = 3000
   ```

---

## 🔧 ENVIRONMENT VARIABLES SETUP

### Required Variables:

```bash
# Database (Supabase)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
JWT_SECRET=your-super-secret-32-character-minimum-string

# Optional: Service Role (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Email service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: File storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### How to Set Environment Variables:

#### Vercel:
1. Project Settings → Environment Variables
2. Add each variable with name and value
3. Apply to: Production, Preview, Development

#### Azure:
1. Static Web Apps → Configuration
2. Application settings → Add
3. Save changes

#### Railway:
1. Project → Variables
2. Add variable → Save

---

## 🧪 TESTING YOUR DEPLOYMENT

### Pre-Launch Checklist:

1. **Database Connection**:
   ```bash
   # Test in browser console
   console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
   ```

2. **Authentication**:
   - Register new user
   - Login/logout
   - Password reset

3. **Core Features**:
   - Report lost item
   - Report found item
   - Browse items (only lost items for regular users)
   - Admin login (see found items)

4. **Security**:
   - Non-admin users can't see found items
   - Admin users can access /admin/found-items
   - API endpoints require authentication

5. **Performance**:
   - Page load times < 3 seconds
   - Images load properly
   - Mobile responsive

---

## 🔒 SECURITY CHECKLIST

### Database Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Proper user policies
- ✅ Service role key secured
- ✅ Database backups enabled

### Application Security:
- ✅ HTTPS everywhere
- ✅ JWT tokens secured
- ✅ Input validation
- ✅ CORS properly configured
- ✅ Environment variables secured

### Access Control:
- ✅ Found items hidden from public
- ✅ Admin-only endpoints protected
- ✅ User authentication required
- ✅ File upload security

---

## 📈 MONITORING & MAINTENANCE

### Set Up Monitoring:

1. **Vercel Analytics**:
   - Enable in project settings
   - Monitor page views, performance

2. **Supabase Dashboard**:
   - Monitor database usage
   - Check API requests
   - Review logs

3. **Error Tracking**:
   - Add Sentry for error monitoring
   - Set up alerts for downtime

### Regular Maintenance:

- **Weekly**: Check error logs
- **Monthly**: Review database performance
- **Quarterly**: Update dependencies
- **Annually**: Review security settings

---

## 💰 COST BREAKDOWN

### Free Tier Limits:

#### Vercel Free:
- 100GB bandwidth/month
- 100 deployments/day
- 12 serverless functions
- Custom domain included

#### Supabase Free:
- 500MB database
- 50MB file storage
- 2GB bandwidth
- 50,000 monthly API requests

#### Total Monthly Cost:
- **Free tier**: $0/month (perfect for development)
- **Paid tier**: ~$20-50/month (for production)

---

## 🆘 TROUBLESHOOTING

### Common Issues:

#### Build Failures:
```bash
# Check these files:
- package.json dependencies
- Environment variables
- Build command in hosting platform
```

#### Database Connection:
```bash
# Verify:
- Supabase URL is correct
- API keys are valid
- RLS policies allow access
```

#### API Errors:
```bash
# Check:
- CORS configuration
- Authentication tokens
- Function timeout limits
```

### Getting Help:
- **Vercel**: Discord community, documentation
- **Supabase**: GitHub issues, Discord
- **Azure**: Microsoft docs, Stack Overflow

---

## 🎉 SUCCESS! Your App is Live

After following this guide, your Lost & Found application will be:

✅ **Fully functional** with database
✅ **Secure** with proper access controls  
✅ **Scalable** with modern hosting
✅ **Monitored** with analytics
✅ **Professional** with custom domain

### Your live app includes:
- **User registration/login**
- **Lost item reporting**
- **Found item management (admin-only)**
- **Admin dashboard**
- **Secure API endpoints**
- **Mobile-responsive design**
- **Real-time database**

**Sample URLs after deployment:**
- **Vercel**: `https://lost-found-app.vercel.app`
- **Azure**: `https://lost-found-app.azurestaticapps.net`
- **Custom**: `https://yourdomain.com`

---

*Need help? The detailed steps above will get your app running in production with full database integration!* 🚀

# 🚀 Lost & Found App - Complete Setup Guide

This guide will walk you through setting up the entire Lost & Found application from scratch.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (optional for local development) - [Download here](https://www.mongodb.com/try/download/community)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🗂️ Project Structure

```
lost-and-found-app/
├── frontend/          # React.js application
├── backend/           # Node.js + Express API
├── SETUP_GUIDE.md     # This file
└── README.md          # Project overview
```

---

## 🎯 Part 1: Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd "c:\Users\karti\OneDrive\Desktop\lost and found\lost-and-found-app\frontend"
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Create Frontend Environment File
Create a `.env` file in the frontend directory:

```bash
# Create .env file
echo. > .env
```

### 4. Configure Frontend Environment Variables
Open the `.env` file and add:

```env
# React App Configuration
REACT_APP_NAME=Lost & Found App
REACT_APP_VERSION=1.0.0

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_URL_PROD=https://your-backend-domain.com/api

# Image Upload (when implemented)
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PWA=true

# Development Settings
GENERATE_SOURCEMAP=true
BROWSER=chrome
```

### 5. Test Frontend
```bash
npm start
```
The frontend should open at `http://localhost:3000`

---

## 🔧 Part 2: Backend Setup

### 1. Navigate to Backend Directory
```bash
cd "c:\Users\karti\OneDrive\Desktop\lost and found\lost-and-found-app\backend"
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Create Backend Environment File
```bash
# Create .env file
echo. > .env
```

### 4. Configure Backend Environment Variables

#### Option A: Local MongoDB Setup
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/lostfound
MONGODB_URI_PROD=mongodb://localhost:27017/lostfound_prod

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRES_IN=30d

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PROD=https://your-frontend-domain.com

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@lostfound.com

# Image Storage (Optional - for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Azure AI (Optional - for advanced features)
AZURE_CV_ENDPOINT=your_azure_endpoint
AZURE_CV_KEY=your_azure_key
```

#### Option B: MongoDB Atlas Setup (Recommended)
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lostfound?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/lostfound_prod?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRES_IN=30d

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PROD=https://your-frontend-domain.com

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@lostfound.com

# Image Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Azure AI (Optional)
AZURE_CV_ENDPOINT=your_azure_endpoint
AZURE_CV_KEY=your_azure_key
```

---

## 🗄️ Part 3: Database Setup

### Option A: Local MongoDB

1. **Install MongoDB Community Edition**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for Windows

2. **Start MongoDB Service**
   ```bash
   # Start MongoDB service (Windows)
   net start MongoDB
   
   # Or start manually
   mongod
   ```

3. **Verify Connection**
   ```bash
   # Open MongoDB shell
   mongo
   
   # Or use MongoDB Compass (GUI)
   ```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Choose "Create a deployment"
   - Select "M0 Sandbox" (Free tier)
   - Choose your preferred region
   - Click "Create Deployment"

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set permissions to "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

---

## 🚀 Part 4: Running the Application

### 1. Start Backend Server
```bash
# In backend directory
cd backend
npm run dev
```
Backend should be running at `http://localhost:5000`

### 2. Start Frontend Development Server
```bash
# In frontend directory (new terminal)
cd frontend
npm start
```
Frontend should be running at `http://localhost:3000`

### 3. Verify Everything is Working

#### Test Backend API:
```bash
# Test health endpoint
curl http://localhost:5000/health

# Or open in browser
http://localhost:5000/health
```

#### Test Frontend:
- Open `http://localhost:3000` in your browser
- You should see the Lost & Found homepage

---

## 🔧 Part 5: Optional Configurations

### Email Service Setup (For Production)

1. **Gmail Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the app password in `EMAIL_PASS`

2. **Other Email Services**
   - **Outlook**: Use `smtp-mail.outlook.com` with port 587
   - **SendGrid**: Professional email service
   - **Mailgun**: Developer-friendly email API

### Image Storage Setup (Cloudinary)

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free account

2. **Get API Credentials**
   - Go to Dashboard
   - Copy Cloud name, API Key, and API Secret
   - Add to your `.env` file

### Azure AI Setup (Optional)

1. **Create Azure Account**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Create free account

2. **Create Computer Vision Resource**
   - Search for "Computer Vision"
   - Create new resource
   - Get endpoint URL and API key

---

## 🧪 Part 6: Testing the Setup

### 1. Test User Registration
```bash
# Test API endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "studentId": "12345678",
    "course": "Computer Science",
    "year": "3rd Year",
    "phoneNumber": "+1234567890",
    "password": "testpassword123",
    "confirmPassword": "testpassword123"
  }'
```

### 2. Test Frontend Registration
- Go to `http://localhost:3000/auth`
- Try registering a new user
- Check browser console for any errors

---

## 📱 Part 7: Development Workflow

### Daily Development
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### Useful Commands
```bash
# Backend
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests

# Frontend
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
netstat -an | findstr :27017

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Should be v16 or higher
```

#### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check Console Logs**
   - Browser Developer Tools (F12)
   - Terminal output

2. **Common Solutions**
   - Restart both servers
   - Clear browser cache
   - Check environment variables
   - Verify database connection

---

## ✅ Success Checklist

- [ ] Node.js installed and working
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Environment files created and configured
- [ ] Database (MongoDB) set up and running
- [ ] Backend server starts without errors
- [ ] Frontend starts without errors
- [ ] Can register a new user
- [ ] API endpoints respond correctly
- [ ] No console errors in browser

---

## 🎉 Next Steps

Once everything is set up:

1. **Explore the Application**
   - Register a test user
   - Report a lost item
   - Browse items
   - Test the matching system

2. **Development Features**
   - Add new pages/components
   - Implement API integrations
   - Customize styling
   - Add new features

3. **Production Deployment**
   - Set up production environment variables
   - Deploy backend to Railway/Heroku
   - Deploy frontend to Vercel/Netlify
   - Configure production database

---

**🎯 You're all set! Your Lost & Found app should now be running successfully!**

If you encounter any issues, refer to the troubleshooting section or check the individual README files in the frontend and backend directories.

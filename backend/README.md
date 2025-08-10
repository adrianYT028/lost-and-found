# Lost & Found Backend API

A comprehensive RESTful API for the Lost & Found application built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication**: Registration, login, email verification, password reset
- **Item Management**: Report lost/found items with images and detailed descriptions
- **Smart Matching**: Automatic matching algorithm based on multiple criteria
- **Real-time Communication**: Message system between matched users
- **Verification Process**: Multi-step verification for item returns
- **Notification System**: Real-time notifications for matches, messages, and updates
- **Trust System**: User trust scores based on successful returns
- **Admin Dashboard**: User management and moderation tools
- **Image Upload**: Cloudinary integration for image storage
- **AI Integration**: Azure Cognitive Services for image analysis
- **Security**: JWT authentication, rate limiting, input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher) or MongoDB Atlas
- Cloudinary account (for image uploads)
- Azure Cognitive Services account (optional, for AI features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd lost-and-found-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/lostfound
   MONGODB_URI_PROD=your_production_mongodb_uri
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=30d
   
   # Frontend URLs
   FRONTEND_URL=http://localhost:3001
   FRONTEND_URL_PROD=https://your-app.vercel.app
   
   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@yourdomain.com
   
   # Azure Cognitive Services (Optional)
   AZURE_CV_ENDPOINT=your_azure_endpoint
   AZURE_CV_KEY=your_azure_key
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Use the connection string in MONGODB_URI

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Run tests
   npm test
   ```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `POST /auth/verify-email/:token` - Verify email
- `POST /auth/resend-verification` - Resend verification email

### Items Endpoints
- `GET /items` - Get all items (with filtering)
- `GET /items/my` - Get user's items
- `GET /items/:id` - Get single item
- `POST /items` - Create new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item
- `POST /items/:id/claim` - Claim an item
- `POST /items/:id/mark-returned` - Mark as returned
- `POST /items/:id/inquire` - Send inquiry
- `GET /items/:id/inquiries` - Get inquiries
- `GET /items/stats/overview` - Get statistics

### Matches Endpoints
- `GET /matches` - Get user's matches
- `GET /matches/:id` - Get single match
- `POST /matches` - Create new match
- `PUT /matches/:id/action` - Accept/reject match
- `POST /matches/:id/messages` - Send message
- `POST /matches/:id/schedule-verification` - Schedule verification
- `POST /matches/:id/complete-verification` - Complete verification
- `POST /matches/:id/complete-return` - Complete return
- `POST /matches/:id/rating` - Add satisfaction rating

### Users Endpoints
- `GET /users/profile/:id` - Get user profile
- `GET /users/search` - Search users
- `GET /users/leaderboard` - Get leaderboard
- `GET /users/stats` - Get user statistics
- `PUT /users/:id/trust-score` - Update trust score (Admin)
- `PUT /users/:id/status` - Update account status (Admin)
- `GET /users/admin/list` - Get all users (Admin)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## 📊 Database Schema

### Users Collection
- Personal information (name, email, student ID)
- Authentication data (password, verification tokens)
- Statistics (items reported, returned, trust score)
- Preferences and privacy settings

### Items Collection
- Item details (title, description, category, type)
- Location and timing information
- Images and characteristics
- Status tracking and ownership
- Inquiries and analytics

### Matches Collection
- Linked lost and found items
- User actions and verification process
- Communication messages
- Return process and ratings

### Notifications Collection
- User notifications for various events
- Delivery status across channels
- Priority and action requirements

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `PORT` | Server port | No | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `EMAIL_HOST` | Email SMTP host | No | - |
| `AZURE_CV_ENDPOINT` | Azure Computer Vision endpoint | No | - |

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting per endpoint
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Request compression

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test auth.test.js
```

## 📈 Monitoring and Logging

- Request logging with Morgan
- Error tracking and handling
- Performance monitoring
- Database query optimization
- Memory usage tracking

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI_PROD=your_production_mongodb_atlas_uri
   JWT_SECRET=your_very_secure_production_secret
   ```

2. **Build and Deploy**
   ```bash
   npm start
   ```

3. **Database Migration**
   ```bash
   npm run seed  # Optional: seed initial data
   ```

### Deployment Platforms
- **Heroku**: Easy deployment with Git
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS deployment
- **AWS/GCP**: Cloud deployment

## 🔍 API Testing

Use tools like Postman, Insomnia, or curl to test the API:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "studentId": "12345678",
    "course": "Computer Science",
    "year": "3rd Year",
    "phoneNumber": "+1234567890",
    "password": "securepassword",
    "confirmPassword": "securepassword"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@yourdomain.com
- Documentation: [API Docs](https://your-api-docs.com)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the database
- Cloudinary for image storage
- Azure for AI services
- All contributors and testers

---

**Built with ❤️ for Bennett University Lost & Found System**

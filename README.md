# 🎓 College Lost and Found Management System

A comprehensive web application designed to help college students and administrators manage lost and found items efficiently. Built with React.js frontend and Node.js/Express.js backend with AI-powered matching capabilities.

## ✨ Features

### 👨‍🎓 Student Features
- **User Registration & Authentication**: Secure signup/login with email verification
- **Report Lost Items**: Submit detailed reports with images, descriptions, and location
- **Report Found Items**: Register found items with detailed information
- **Browse Items**: Search and filter through lost/found items
- **AI-Powered Matching**: Get intelligent suggestions for potential matches
- **Claim Items**: Secure claiming process with verification
- **Profile Management**: Track your submitted and claimed items
- **Real-time Notifications**: Email notifications for matches and claims

### � Admin Features
- **Comprehensive Dashboard**: Overview statistics and analytics
- **Item Management**: View, edit, verify, and manage all items
- **User Management**: Manage user accounts, roles, and permissions
- **Bulk Operations**: Perform actions on multiple items simultaneously
- **Analytics & Reporting**: Detailed insights into system usage
- **Data Export**: Export data to CSV for external analysis
- **Status Management**: Update item statuses (open, claimed, closed, matched)
- **Collection Management**: Manage item collection processes

## �️ Technology Stack

### Frontend
- **React.js** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email services

## 📁 Project Structure

```
lost-and-found-app/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API service functions
│   │   └── App.js          # Main application component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Sequelize database models
│   │   └── server.js       # Express server setup
│   ├── uploads/            # User uploaded images
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/college-lost-and-found.git
cd college-lost-and-found
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your database configuration
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Configuration
Create a PostgreSQL database and update your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lost_and_found
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 4. Start Backend Server
```bash
npm start
# Server will run on http://localhost:5002
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm start
# Frontend will run on http://localhost:3001
```

## 👨‍💼 Admin Access

Default admin credentials:
- **Email**: `admin@college.edu`
- **Password**: `admin123`

⚠️ **Important**: Change the default admin password in production!

## 📊 Database Schema

### Key Models
- **Users**: Student and admin accounts
- **Items**: Lost and found item records
- **Status Enum**: `'open', 'claimed', 'closed', 'active', 'matched'`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/items` - All items (admin view)
- `GET /api/admin/users` - All users
- `POST /api/admin/items/bulk-action` - Bulk operations

## 🎯 Usage

### For Students
1. **Register/Login** to your account
2. **Report Lost Items**: Click "Report Lost" and fill in details
3. **Report Found Items**: Click "Report Found" with item details
4. **Browse Items**: Use search and filters to find items
5. **Claim Items**: Contact owners or admins for verified items

### For Administrators
1. **Login** with admin credentials
2. **Dashboard**: View system statistics and recent activity
3. **Manage Items**: Verify, edit, or delete item reports
4. **Manage Users**: Handle user accounts and permissions
5. **Analytics**: Generate reports and export data

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Role-based access control
- Input validation and sanitization
- File upload restrictions

## 🚀 Deployment

### Production Checklist
- [ ] Update database credentials
- [ ] Change default admin password
- [ ] Configure email service
- [ ] Set up file storage (AWS S3/CloudFront)
- [ ] Configure HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- Built for college communities to streamline lost and found processes
- Inspired by the need for better campus item recovery systems
- Thanks to all contributors and testers

## 📞 Support

For support, email admin@college.edu or create an issue in this repository.

---

**Made with ❤️ for the college community**

# Cloud Lab Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Cloud Lab Management System is a comprehensive solution designed for managing multi-campus laboratory facilities. It provides integrated tools for inventory management, lab booking, budget tracking, and resource optimization.

### Key Benefits
- **Centralized Management**: Manage multiple campuses from a single platform
- **Real-time Tracking**: Monitor inventory, bookings, and budgets in real-time
- **Resource Optimization**: Improve lab utilization and reduce waste
- **Data-Driven Decisions**: Comprehensive analytics and reporting
- **Scalable Architecture**: Cloud-based solution that grows with your needs

## ✨ Features

### Core Modules

#### 1. **User Management**
- Multi-role support (Admin, Lab Manager, Instructor, Student)
- Role-based access control (RBAC)
- Campus-specific permissions
- Activity tracking and audit logs

#### 2. **Campus Management**
- Multi-campus support
- Department hierarchies
- Operating hours configuration
- Budget allocation per campus

#### 3. **Lab Management**
- Lab profiles with specifications
- Equipment and software tracking
- Maintenance scheduling
- Safety protocols management

#### 4. **Inventory Management**
- Real-time inventory tracking
- Automated reorder alerts
- Maintenance scheduling
- Asset lifecycle management
- Barcode/QR code support

#### 5. **Booking System**
- Conflict-free scheduling
- Recurring bookings
- Approval workflows
- Resource allocation
- Calendar integration

#### 6. **Budget Tracking**
- Real-time expense monitoring
- Budget alerts and thresholds
- Category-wise tracking
- Financial forecasting
- Comprehensive reporting

#### 7. **Analytics & Reports**
- Utilization metrics
- Trend analysis
- Custom report generation
- Data export (Excel, PDF)
- Dashboard visualizations

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│                   React.js + Material-UI                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│                 Node.js + Express.js + Socket.io             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│                         MongoDB                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

- **Frontend**: React with TypeScript, Material-UI for components
- **Backend**: Node.js with Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT-based with refresh tokens
- **File Storage**: Local storage with cloud backup support

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI v5
- **State Management**: Context API + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Chart.js + Recharts
- **Calendar**: FullCalendar

### Development Tools
- **Package Manager**: npm/yarn
- **Version Control**: Git
- **API Testing**: Postman
- **Code Quality**: ESLint + Prettier

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/cloud-lab-management.git
cd cloud-lab-management
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cloud_lab_management

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Step 5: Database Setup
```bash
# Start MongoDB service
mongod

# Optional: Import sample data
npm run seed
```

### Step 6: Start the Application

#### Development Mode
```bash
# Start backend server
npm run dev

# In another terminal, start frontend
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ⚙️ Configuration

### Database Configuration
MongoDB connection settings can be modified in `.env`:
```env
MONGODB_URI=mongodb://username:password@host:port/database
```

### Email Configuration
For email notifications, configure SMTP settings:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### File Upload Configuration
```env
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "instructor",
  "campus": "campus_id",
  "department": "Computer Science"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Campus Management

#### Get All Campuses
```http
GET /api/campus
Authorization: Bearer {token}
```

#### Create Campus
```http
POST /api/campus
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Main Campus",
  "code": "MC001",
  "address": {...},
  "contact": {...}
}
```

### Lab Management

#### Get Labs
```http
GET /api/labs
Authorization: Bearer {token}
```

#### Create Lab
```http
POST /api/labs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Computer Lab 1",
  "code": "CL001",
  "campus": "campus_id",
  "capacity": 30,
  "type": "computer"
}
```

### Inventory Management

#### Get Inventory Items
```http
GET /api/inventory
Authorization: Bearer {token}
```

#### Add Inventory Item
```http
POST /api/inventory
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemCode": "ITM001",
  "name": "Desktop Computer",
  "category": "equipment",
  "quantity": {"total": 30, "available": 25},
  "lab": "lab_id"
}
```

### Booking System

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "lab": "lab_id",
  "title": "Programming Class",
  "date": "2024-01-15",
  "timeSlot": {"start": "09:00", "end": "11:00"},
  "participants": {"expected": 25}
}
```

## 👤 User Guide

### Getting Started

#### First-Time Setup
1. **Admin Registration**: The first user registered becomes the system administrator
2. **Campus Setup**: Create campus profiles with details
3. **Lab Configuration**: Add labs with specifications
4. **User Invitation**: Invite lab managers and instructors

### User Roles

#### System Administrator
- Full system access
- User management
- Global settings configuration
- Cross-campus reporting

#### Lab Manager
- Lab operations management
- Inventory control
- Booking approvals
- Budget monitoring

#### Instructor
- Create and manage bookings
- Request resources
- View schedules
- Submit feedback

#### Student
- View lab schedules
- Limited booking capabilities
- Access learning resources

### Common Workflows

#### Creating a Lab Booking
1. Navigate to Bookings → New Booking
2. Select lab and date
3. Choose time slot
4. Add participants and resources
5. Submit for approval (if required)

#### Managing Inventory
1. Go to Inventory → Add Item
2. Enter item details and specifications
3. Set reorder points and alerts
4. Upload item images/documents
5. Save and track

#### Budget Tracking
1. Access Budget → Current Period
2. View spending by category
3. Set up alerts for thresholds
4. Generate financial reports
5. Export data for analysis

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: MongoDB connection failed
```
**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify network connectivity

#### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**:
- Change port in `.env` file
- Kill process using the port: `lsof -i :5000`

#### Authentication Issues
```
Error: Invalid token
```
**Solution**:
- Clear browser cookies
- Generate new token by logging in again
- Check JWT_SECRET in `.env`

### Performance Optimization

#### Database Indexing
```javascript
// Add indexes for frequently queried fields
db.labs.createIndex({ campus: 1, type: 1 })
db.bookings.createIndex({ date: 1, status: 1 })
db.inventory.createIndex({ lab: 1, category: 1 })
```

#### Caching Strategy
- Implement Redis for session management
- Cache frequently accessed data
- Use CDN for static assets

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@cloudlabmanagement.com
- Documentation: [https://docs.cloudlabmanagement.com](https://docs.cloudlabmanagement.com)
- Issues: [GitHub Issues](https://github.com/yourusername/cloud-lab-management/issues)

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB team for the database
- Open source community for various packages

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained By**: Cloud Lab Management Team
# Comprehensive Cloud Lab Management System

A complete web-based solution for managing multi-campus laboratory facilities, inventory, bookings, and budgets.

## 🌟 Features

### 🏢 Multi-Campus Support
- Centralized management across multiple campuses
- Campus-specific budget allocation and tracking
- Location-based filtering and organization
- Hierarchical access control

### 🔬 Lab Management
- Comprehensive lab profiles with capacity and equipment details
- Real-time availability checking
- Equipment list management
- Hourly rate configuration and cost calculation
- Lab status tracking (Active, Maintenance, Inactive)

### 📦 Inventory Management
- Real-time inventory tracking and availability
- Category-based organization (Computing, Electronics, Optics, etc.)
- Warranty expiry alerts and monitoring
- Supplier information and cost tracking
- Quantity management (Total vs Available)
- Status tracking (Active, Maintenance, Retired)

### 📅 Booking System
- Intuitive lab booking interface
- Automated cost calculation based on duration
- Conflict detection and prevention
- Booking status management (Pending, Confirmed, Completed, Cancelled)
- Participant count tracking
- Purpose and notes documentation

### 💰 Budget Management
- Campus-wise budget allocation and tracking
- Real-time budget utilization monitoring
- Transaction history and audit trail
- Multiple transaction types (Booking, Maintenance, Purchase, Allocation)
- Comprehensive financial reporting
- Monthly and yearly budget analysis

### 👥 User Management
- Role-based access control (Admin, Manager, User)
- JWT authentication with secure password hashing
- Campus-specific user assignments
- User registration and profile management

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- Budget utilization charts and trends
- Lab booking patterns analysis
- Inventory status reports
- Custom date range reporting
- Visual charts and graphs

## 🛠 Technology Stack

### Frontend
- **React.js 18.x** - Modern JavaScript framework
- **Material-UI (MUI)** - Professional component library
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Recharts** - Data visualization and charts
- **Day.js** - Date manipulation library

### Backend
- **Python 3.8+** - Programming language
- **Flask** - Lightweight web framework
- **SQLAlchemy** - Object-relational mapping
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Database management system

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lab-management-system
   ```

2. **Set up the backend**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Initialize the database
   python app.py
   ```

3. **Set up the frontend**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Start the development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Login Credentials
- **Admin**: admin / admin123
- **Manager**: manager1 / manager123
- **Student**: student1 / student123

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Campus Management
- `GET /api/campuses` - Get all campuses
- `POST /api/campuses` - Create new campus
- `PUT /api/campuses/{id}` - Update campus
- `DELETE /api/campuses/{id}` - Delete campus

### Lab Management
- `GET /api/labs` - Get all labs
- `POST /api/labs` - Create new lab
- `PUT /api/labs/{id}` - Update lab
- `DELETE /api/labs/{id}` - Delete lab

### Inventory Management
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Booking Management
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Budget Management
- `GET /api/budget/summary` - Get budget summary
- `GET /api/budget/transactions` - Get transaction history

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data

## 🏗 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React.js      │    │   Flask API      │    │   SQLite        │
│   Frontend      │────│   Backend        │────│   Database      │
│                 │    │                  │    │                 │
│ • Material-UI   │    │ • JWT Auth       │    │ • User Data     │
│ • Routing       │    │ • RESTful API    │    │ • Lab Data      │
│ • State Mgmt    │    │ • SQLAlchemy     │    │ • Bookings      │
│ • Charts        │    │ • CORS           │    │ • Inventory     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Role-Based Access Control** - Different permissions for different user roles
- **API Protection** - All endpoints protected with authentication
- **Input Validation** - Comprehensive input sanitization
- **CORS Configuration** - Secure cross-origin resource sharing

## 👥 User Roles & Permissions

### Administrator
- Full system access and configuration
- Campus and lab management
- User management and role assignment
- System-wide budget oversight
- Analytics and reporting access

### Manager
- Campus-specific management
- Lab and inventory management for assigned campus
- Budget monitoring for their campus
- User booking approval and oversight
- Campus-specific analytics

### User/Student
- Lab booking and scheduling
- View available labs and equipment
- Personal booking history
- Basic inventory viewing
- Profile management

## 📱 Responsive Design

The system is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Database Configuration
DATABASE_URL=sqlite:///lab_management.db

# CORS Configuration
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration
Update `src/services/api.js` for API base URL:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## 🧪 Testing

### Backend Testing
```bash
# Run Python tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=app tests/
```

### Frontend Testing
```bash
# Run React tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Configure production settings**
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-production-secret-key
   ```

3. **Start the production server**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Cloud Deployment
The system can be deployed on:
- AWS (EC2, Elastic Beanstalk, Lambda)
- Google Cloud Platform (App Engine, Compute Engine)
- Microsoft Azure (App Service, Virtual Machines)
- Heroku
- DigitalOcean

## 📊 Database Schema

### Key Tables
- **users** - User accounts and authentication
- **campuses** - Campus information and budgets
- **labs** - Laboratory details and configurations
- **inventory_items** - Equipment and supply tracking
- **bookings** - Lab reservations and scheduling
- **budget_transactions** - Financial transaction records

### Relationships
- Users belong to campuses
- Labs belong to campuses
- Inventory items belong to labs
- Bookings link users and labs
- Budget transactions track campus spending

## 🔄 Data Flow

1. **User Authentication** - JWT tokens for secure API access
2. **Frontend Requests** - React components make API calls
3. **Backend Processing** - Flask routes handle business logic
4. **Database Operations** - SQLAlchemy manages data persistence
5. **Response Handling** - JSON responses update frontend state

## 📈 Performance Optimization

- **Database Indexing** - Optimized queries with proper indexes
- **Caching** - Frontend state management and API response caching
- **Lazy Loading** - Components loaded on demand
- **Pagination** - Large datasets split into manageable chunks
- **Compression** - Gzip compression for API responses

## 🛡 Backup & Recovery

### Database Backup
```bash
# Create backup
sqlite3 lab_management.db ".backup backup.db"

# Restore from backup
sqlite3 lab_management.db ".restore backup.db"
```

### Automated Backups
Set up automated daily backups using cron jobs or cloud services.

## 📚 Additional Resources

- [User Manual](docs/user-manual.md)
- [Admin Guide](docs/admin-guide.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [FAQ](docs/faq.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@labmanagement.com
- Documentation: [Wiki](wiki/)
- Issues: [GitHub Issues](issues/)

## 🗺 Roadmap

### Version 2.0 (Planned)
- Mobile applications (iOS/Android)
- Advanced analytics and machine learning
- Integration with external systems
- Multi-language support
- Advanced notification system

### Version 2.1 (Future)
- QR code integration
- Video conferencing integration
- Automated maintenance scheduling
- Business intelligence dashboard
- Third-party API integrations

---

**Built with ❤️ for educational institutions and research facilities**
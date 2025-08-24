# Lab Management System - Step-by-Step Execution Guide

This guide provides detailed instructions for setting up, running, and using the Comprehensive Cloud Lab Management System.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

### Required Software
- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads/)
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

## 🚀 Step 1: Download and Setup

### 1.1 Clone or Download the Project
```bash
# If you have Git installed
git clone <repository-url>
cd lab-management-system

# Or download and extract the ZIP file to a folder
```

### 1.2 Verify Prerequisites
```bash
# Check Python version
python --version
# Should show Python 3.8.x or higher

# Check Node.js version
node --version
# Should show v16.x.x or higher

# Check npm version
npm --version
# Should show 8.x.x or higher
```

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Project Directory
```bash
cd /path/to/lab-management-system
```

### 2.2 Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv lab_env

# Activate virtual environment
# On Windows:
lab_env\Scripts\activate

# On macOS/Linux:
source lab_env/bin/activate
```

### 2.3 Install Python Dependencies
```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
```

### 2.4 Initialize the Database
```bash
# Run the Flask application to create database
python app.py
```

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
 * Database initialized with sample data
```

**Keep this terminal open** - the backend server is now running.

## 🎨 Step 3: Frontend Setup

### 3.1 Open New Terminal
Open a new terminal/command prompt window and navigate to the project directory.

### 3.2 Install Node.js Dependencies
```bash
# Install all required packages
npm install

# This may take a few minutes
```

### 3.3 Start the Frontend Development Server
```bash
# Start React development server
npm start
```

The frontend should automatically open in your browser at `http://localhost:3000`.

## 🌐 Step 4: Access the Application

### 4.1 Open Your Web Browser
Navigate to: `http://localhost:3000`

### 4.2 Login with Demo Accounts
Use these pre-configured accounts:

**Administrator Account:**
- Username: `admin`
- Password: `admin123`

**Manager Account:**
- Username: `manager1`
- Password: `manager123`

**Student Account:**
- Username: `student1`
- Password: `student123`

## 📚 Step 5: System Overview and Navigation

### 5.1 Dashboard
After logging in, you'll see the main dashboard with:
- System statistics (campuses, labs, bookings, inventory)
- Budget overview charts
- Recent booking activity
- Quick access to all modules

### 5.2 Navigation Menu
The left sidebar contains:
- **Dashboard** - System overview and analytics
- **Campuses** - Multi-campus management (Admin only)
- **Labs** - Laboratory management
- **Inventory** - Equipment and supplies tracking
- **Bookings** - Lab reservation system
- **Budget** - Financial management (Admin/Manager only)

## 🏢 Step 6: Campus Management (Admin Only)

### 6.1 View Campuses
1. Click on **"Campuses"** in the sidebar
2. View existing campuses in both card and table format
3. See budget allocation and usage for each campus

### 6.2 Add New Campus
1. Click **"Add Campus"** button
2. Fill in the form:
   - Campus Name (required)
   - Location (required)
   - Contact Email
   - Contact Phone
   - Budget Allocated
3. Click **"Create"** to save

### 6.3 Edit Campus
1. Click the edit icon on any campus card or table row
2. Modify the information
3. Click **"Update"** to save changes

## 🔬 Step 7: Lab Management

### 7.1 View Labs
1. Click on **"Labs"** in the sidebar
2. Browse labs in card or table view
3. Filter by campus if needed

### 7.2 Add New Lab
1. Click **"Add Lab"** button
2. Fill in the form:
   - Lab Name (required)
   - Campus (required)
   - Description
   - Capacity (required)
   - Hourly Rate
   - Location
   - Status (Active/Maintenance/Inactive)
   - Equipment List (add items one by one)
3. Click **"Create"** to save

### 7.3 Manage Equipment List
1. In the lab form, find "Equipment List" section
2. Type equipment name and click **"Add"**
3. Remove items by clicking the X on chips
4. Save the lab to update equipment list

## 📦 Step 8: Inventory Management

### 8.1 View Inventory
1. Click on **"Inventory"** in the sidebar
2. Browse inventory items
3. Check availability status and warranty information

### 8.2 Add Inventory Item
1. Click **"Add Item"** button
2. Fill in the form:
   - Item Name (required)
   - Category
   - Description
   - Lab Assignment (required)
   - Supplier
   - Total Quantity (required)
   - Available Quantity (required)
   - Unit Cost
   - Purchase Date
   - Warranty Expiry
   - Status
3. Click **"Create"** to save

### 8.3 Monitor Warranty Status
- Items with expired warranties show red warning icons
- Items expiring within 30 days show orange warning icons
- Plan replacements based on warranty status

## 📅 Step 9: Booking System

### 9.1 View Bookings
1. Click on **"Bookings"** in the sidebar
2. See all bookings (filtered by user role)
3. Check booking status and details

### 9.2 Create New Booking
1. Click **"Book Lab"** button
2. Fill in the booking form:
   - Lab (required) - shows hourly rate
   - Start Time (required)
   - End Time (required) - automatically set to 1 hour after start
   - Purpose
   - Number of Participants (required)
   - Notes
3. Review the booking summary with estimated cost
4. Click **"Book Lab"** to create

### 9.3 Booking Cost Calculation
- Cost is automatically calculated based on duration and lab hourly rate
- Duration is shown in the booking summary
- Total cost is displayed before confirmation

## 💰 Step 10: Budget Management (Admin/Manager Only)

### 10.1 View Budget Overview
1. Click on **"Budget"** in the sidebar
2. See summary cards with total allocated, used, and remaining budgets
3. View budget usage percentage

### 10.2 Campus Budget Details
1. Use the campus filter dropdown to view specific campus budgets
2. See detailed budget breakdown with progress bars
3. Monitor budget utilization percentages

### 10.3 Transaction History
1. Scroll down to see recent transactions
2. Filter by campus if needed
3. View transaction types: booking, maintenance, purchase, allocation

### 10.4 Budget Analytics
- View budget overview charts by campus
- See spending by category (pie chart)
- Monitor monthly spending trends (line chart)

## 📊 Step 11: Analytics and Reporting

### 11.1 Dashboard Analytics
- Real-time system statistics
- Budget utilization charts
- Recent activity summaries
- Campus performance indicators

### 11.2 Generate Reports
1. Use date filters where available
2. Export data using browser print functionality
3. Take screenshots for documentation

## 👥 Step 12: User Management

### 12.1 Register New Users
1. Click on user avatar in sidebar
2. Use the registration tab in login screen
3. Fill in user details:
   - Username (required)
   - Email (required)
   - Role (User/Manager/Admin)
   - Password (required)
   - Confirm Password (required)

### 12.2 Role-Based Access
- **Admin**: Full system access
- **Manager**: Campus-specific management
- **User**: Booking and viewing only

## 🔧 Step 13: Troubleshooting

### 13.1 Backend Issues

**Problem**: "Module not found" error
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: Database error
```bash
# Solution: Delete database and restart
rm lab_management.db
python app.py
```

**Problem**: Port 5000 already in use
```bash
# Solution: Kill process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### 13.2 Frontend Issues

**Problem**: "npm install" fails
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Browser shows "Cannot GET /"
```bash
# Solution: Ensure both servers are running
# Backend: python app.py (port 5000)
# Frontend: npm start (port 3000)
```

**Problem**: API calls fail
- Check if backend server is running on port 5000
- Verify CORS configuration
- Check browser developer console for errors

## 🔄 Step 14: Regular Operations

### 14.1 Daily Operations
1. **Check Dashboard** - Review system statistics
2. **Monitor Bookings** - Approve pending bookings
3. **Review Budget** - Check spending against allocations
4. **Inventory Check** - Monitor low stock and warranty expiries

### 14.2 Weekly Operations
1. **Generate Reports** - Export booking and budget reports
2. **User Management** - Add new users or update roles
3. **System Maintenance** - Check for any issues or updates

### 14.3 Monthly Operations
1. **Budget Review** - Analyze monthly spending patterns
2. **Inventory Audit** - Update quantities and add new items
3. **System Backup** - Backup database and configuration

## 💾 Step 15: Data Backup

### 15.1 Database Backup
```bash
# Create backup
sqlite3 lab_management.db ".backup backup_$(date +%Y%m%d).db"
```

### 15.2 Configuration Backup
- Copy `.env` file (if created)
- Document any custom configurations
- Save user accounts and role assignments

## 🚀 Step 16: Production Deployment

### 16.1 Prepare for Production
1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Set Environment Variables**:
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secure-secret-key
   ```

3. **Install Production Server**:
   ```bash
   pip install gunicorn
   ```

### 16.2 Run Production Server
```bash
# Start production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 16.3 Serve Frontend
- Use nginx or Apache to serve built frontend files
- Configure reverse proxy to backend API
- Set up SSL certificates for HTTPS

## 📞 Step 17: Getting Help

### 17.1 Documentation
- **README.md** - Comprehensive system documentation
- **API Documentation** - Detailed API reference
- **User Manual** - End-user instructions

### 17.2 Support Channels
- Check the troubleshooting section
- Review error logs in terminal
- Contact system administrator
- Submit bug reports with detailed descriptions

## ✅ Step 18: Verification Checklist

### 18.1 System Setup Verification
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database initialized with sample data
- [ ] All demo accounts working
- [ ] All navigation links functional

### 18.2 Feature Verification
- [ ] Campus management (Admin only)
- [ ] Lab creation and editing
- [ ] Inventory item management
- [ ] Booking creation and cost calculation
- [ ] Budget tracking and reporting
- [ ] User authentication and roles
- [ ] Dashboard analytics working

### 18.3 Data Integrity
- [ ] Sample data loaded correctly
- [ ] Relationships between entities working
- [ ] Budget calculations accurate
- [ ] Booking conflicts prevented
- [ ] Inventory quantities tracked properly

## 🎯 Next Steps

After successful setup and verification:

1. **Customize Data**: Replace sample data with your actual campuses, labs, and inventory
2. **User Training**: Train staff on system usage and best practices
3. **Integration**: Plan integration with existing systems if needed
4. **Monitoring**: Set up monitoring and backup procedures
5. **Scaling**: Plan for increased usage and additional features

---

**Congratulations! 🎉 Your Lab Management System is now ready for use.**

For additional support or questions, refer to the main documentation or contact your system administrator.
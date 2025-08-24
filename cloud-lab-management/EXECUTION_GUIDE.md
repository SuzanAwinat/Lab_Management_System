# 🚀 Cloud Lab Management System - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

Follow these simple steps to get the Cloud Lab Management System running on your local machine.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ **Node.js** installed (version 18 or higher)
- ✅ **MongoDB** installed and running
- ✅ **Git** installed
- ✅ **Web browser** (Chrome, Firefox, Safari, or Edge)

### Check Prerequisites
```bash
# Check Node.js version
node --version  # Should show v18.x.x or higher

# Check npm version
npm --version   # Should show 8.x.x or higher

# Check MongoDB
mongod --version  # Should show v5.0 or higher

# Check Git
git --version
```

---

## 🎯 Step-by-Step Installation

### Step 1: Download the Project
```bash
# Option A: If you have the project in a zip file
# Extract the zip file to your desired location

# Option B: Clone from repository
git clone <repository-url>

# Navigate to project folder
cd cloud-lab-management
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Start MongoDB
```bash
# Windows
# Start MongoDB service from Services panel or:
mongod

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

### Step 4: Configure Environment
```bash
# The .env file is already created with default settings
# No changes needed for local development
```

### Step 5: Start the Application
```bash
# Open Terminal 1 - Start Backend Server
npm run dev

# Open Terminal 2 - Start Frontend Application
cd client
npm start
```

### Step 6: Access the Application
Open your browser and go to:
```
http://localhost:3000
```

---

## 🎉 First Time Setup

### 1. Create Admin Account
- Click "Register" on the login page
- Fill in your details
- The first user automatically becomes the admin

### 2. Create a Campus
- Login with your admin account
- Go to Campus → Add Campus
- Enter campus details:
  - Name: Main Campus
  - Code: MC001
  - Address details
  - Contact information

### 3. Add a Lab
- Go to Labs → Add Lab
- Enter lab details:
  - Name: Computer Lab 1
  - Code: CL001
  - Select Campus
  - Capacity: 30
  - Type: Computer

### 4. You're Ready!
Start using the system for:
- Managing inventory
- Creating bookings
- Tracking budgets
- Generating reports

---

## 🔧 Common Commands

### Start Everything
```bash
# Backend (Terminal 1)
npm run dev

# Frontend (Terminal 2)
cd client && npm start
```

### Stop Everything
```
Press Ctrl+C in both terminals
```

### Reset Database
```bash
# Clear all data (use with caution!)
mongo cloud_lab_management --eval "db.dropDatabase()"
```

---

## 📱 Default Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:5000 | API endpoints |
| API Docs | http://localhost:5000/api-docs | API documentation |

---

## 👥 Test Accounts

After setting up, you can create test accounts with these roles:

1. **Admin Account** (First registered user)
   - Full system access
   - Can manage everything

2. **Lab Manager**
   - Can manage labs and inventory
   - Approve bookings

3. **Instructor**
   - Can create bookings
   - View schedules

4. **Student**
   - Can view schedules
   - Limited access

---

## 🆘 Quick Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Start MongoDB service
mongod

# Or check if it's running
ps aux | grep mongod
```

### Issue: "Port 3000/5000 already in use"
**Solution:**
```bash
# Find and kill the process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: "Module not found" error
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

cd client
rm -rf node_modules
npm install
```

### Issue: "Login not working"
**Solution:**
1. Clear browser cookies and cache
2. Check MongoDB is running
3. Restart both frontend and backend

---

## 📊 Sample Data Setup (Optional)

To quickly populate the system with sample data:

```bash
# Create sample data script (if not exists)
npm run seed

# This will create:
# - 3 Campuses
# - 10 Labs
# - 50 Inventory items
# - 20 Users
# - Sample bookings and budgets
```

---

## 🎓 Video Tutorials

For visual learners, here's what each section covers:

1. **Installation** (5 mins)
   - Prerequisites setup
   - Project installation
   - First run

2. **Basic Usage** (10 mins)
   - Creating campus and labs
   - Managing inventory
   - Creating bookings

3. **Advanced Features** (15 mins)
   - Budget management
   - Report generation
   - User management

---

## 📞 Need Help?

### Quick Support Options

1. **Check Documentation**
   - README.md - Full documentation
   - API_DOCS.md - API reference

2. **Common Solutions**
   - Restart MongoDB
   - Clear browser cache
   - Reinstall dependencies

3. **Contact Support**
   - Email: support@cloudlabmanagement.com
   - Documentation: See README.md

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Can access login page at http://localhost:3000
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can create a campus
- [ ] Can add a lab
- [ ] Can add inventory items
- [ ] Can create bookings
- [ ] Real-time updates work (open in two browsers)

---

## 🎯 Next Steps

1. **Explore Features**
   - Try all modules
   - Create test data
   - Generate reports

2. **Customize Settings**
   - Update .env for production
   - Configure email notifications
   - Set up backups

3. **Deploy to Production**
   - See DEPLOYMENT.md for cloud deployment
   - Configure SSL certificates
   - Set up monitoring

---

## 💡 Pro Tips

1. **Use Chrome DevTools** for debugging (F12)
2. **Keep MongoDB running** in the background
3. **Use two monitors** - one for code, one for browser
4. **Regular backups** - export data weekly
5. **Test in incognito** mode for clean testing

---

## 🎉 Congratulations!

You've successfully set up the Cloud Lab Management System! 

Start exploring the features and transform your lab operations.

---

**Quick Reference Card**

```bash
# Start Backend
npm run dev

# Start Frontend
cd client && npm start

# Access Application
http://localhost:3000

# Stop Everything
Ctrl+C in both terminals
```

---

*Last Updated: January 2024*  
*Version: 1.0.0*
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'lab_manager', 'instructor', 'student', 'staff'],
    default: 'student'
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus assignment is required']
  },
  department: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canManageBookings: { type: Boolean, default: false },
    canManageBudget: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ campus: 1, department: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role,
      campus: this.campus 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  return token;
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch(this.role) {
      case 'admin':
        this.permissions = {
          canManageUsers: true,
          canManageInventory: true,
          canManageBookings: true,
          canManageBudget: true,
          canViewReports: true,
          canExportData: true
        };
        break;
      case 'lab_manager':
        this.permissions = {
          canManageUsers: false,
          canManageInventory: true,
          canManageBookings: true,
          canManageBudget: true,
          canViewReports: true,
          canExportData: true
        };
        break;
      case 'instructor':
        this.permissions = {
          canManageUsers: false,
          canManageInventory: false,
          canManageBookings: true,
          canManageBudget: false,
          canViewReports: true,
          canExportData: false
        };
        break;
      default:
        this.permissions = {
          canManageUsers: false,
          canManageInventory: false,
          canManageBookings: false,
          canManageBudget: false,
          canViewReports: false,
          canExportData: false
        };
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
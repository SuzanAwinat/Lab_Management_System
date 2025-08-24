const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Lab code is required'],
    unique: true,
    uppercase: true
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required']
  },
  building: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['computer', 'physics', 'chemistry', 'biology', 'engineering', 'electronics', 'multimedia', 'research', 'general'],
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Lab capacity is required'],
    min: 1
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assistants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  specifications: {
    area: Number, // in square feet
    workstations: Number,
    hasProjector: { type: Boolean, default: false },
    hasWhiteboard: { type: Boolean, default: true },
    hasAirConditioning: { type: Boolean, default: true },
    hasSafetyEquipment: { type: Boolean, default: false },
    hasEmergencyShower: { type: Boolean, default: false },
    hasFireExtinguisher: { type: Boolean, default: true },
    hasFirstAidKit: { type: Boolean, default: true },
    internetSpeed: String,
    powerOutlets: Number
  },
  equipment: [{
    name: String,
    quantity: Number,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  software: [{
    name: String,
    version: String,
    licenseType: String,
    licenseExpiry: Date,
    installedOn: Number // number of workstations
  }],
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  rules: [{
    rule: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  safetyProtocols: [{
    protocol: String,
    category: String,
    lastReviewed: Date
  }],
  maintenanceSchedule: {
    daily: [String],
    weekly: [String],
    monthly: [String],
    yearly: [String]
  },
  budget: {
    annual: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    categories: {
      equipment: { allocated: Number, spent: Number },
      software: { allocated: Number, spent: Number },
      maintenance: { allocated: Number, spent: Number },
      supplies: { allocated: Number, spent: Number },
      other: { allocated: Number, spent: Number }
    }
  },
  usage: {
    averageDaily: Number,
    peakHours: [String],
    totalBookings: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'renovation'],
    default: 'active'
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    elevatorAccess: { type: Boolean, default: false },
    adaptiveEquipment: { type: Boolean, default: false }
  },
  emergencyContacts: [{
    name: String,
    role: String,
    phone: String,
    email: String
  }]
}, {
  timestamps: true
});

// Indexes
labSchema.index({ campus: 1, type: 1 });
labSchema.index({ code: 1 });
labSchema.index({ status: 1 });
labSchema.index({ building: 1, floor: 1 });

// Virtual for available capacity (considering current bookings)
labSchema.virtual('availableCapacity').get(function() {
  // This would be calculated based on current bookings
  return this.capacity;
});

// Virtual for budget utilization
labSchema.virtual('budgetUtilization').get(function() {
  if (this.budget.annual === 0) return 0;
  return ((this.budget.spent / this.budget.annual) * 100).toFixed(2);
});

// Method to check if lab is available
labSchema.methods.isAvailable = function() {
  return this.status === 'active';
};

// Method to check operating hours for a day
labSchema.methods.isOpenOn = function(dayOfWeek) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[dayOfWeek] || dayOfWeek.toLowerCase();
  return this.operatingHours[day]?.isOpen || false;
};

// Method to get remaining budget
labSchema.methods.getRemainingBudget = function() {
  return this.budget.annual - this.budget.spent;
};

module.exports = mongoose.model('Lab', labSchema);
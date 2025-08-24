const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campus name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Campus code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    website: String
  },
  administrator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  departments: [{
    name: String,
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  facilities: {
    totalLabs: {
      type: Number,
      default: 0
    },
    totalCapacity: {
      type: Number,
      default: 0
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  budget: {
    allocated: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    fiscalYear: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  metadata: {
    established: Date,
    accreditation: String,
    studentCount: Number,
    staffCount: Number
  }
}, {
  timestamps: true
});

// Indexes
campusSchema.index({ code: 1 });
campusSchema.index({ 'address.city': 1, 'address.state': 1 });
campusSchema.index({ status: 1 });

// Virtual for remaining budget
campusSchema.virtual('remainingBudget').get(function() {
  return this.budget.allocated - this.budget.spent;
});

// Virtual for budget utilization percentage
campusSchema.virtual('budgetUtilization').get(function() {
  if (this.budget.allocated === 0) return 0;
  return ((this.budget.spent / this.budget.allocated) * 100).toFixed(2);
});

// Method to check if campus is operational
campusSchema.methods.isOperational = function() {
  return this.status === 'active';
};

// Method to get operating hours for a specific day
campusSchema.methods.getOperatingHours = function(dayOfWeek) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[dayOfWeek] || dayOfWeek.toLowerCase();
  return this.facilities.operatingHours[day];
};

module.exports = mongoose.model('Campus', campusSchema);
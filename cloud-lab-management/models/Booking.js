const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: [true, 'Lab is required']
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Booking title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'research', 'maintenance', 'event', 'training', 'meeting', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  timeSlot: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: {
      type: String,
      required: [true, 'End time is required']
    },
    duration: Number // in minutes
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: null
    },
    endDate: Date,
    occurrences: Number,
    exceptions: [Date] // dates to skip in recurring pattern
  },
  participants: {
    expected: {
      type: Number,
      required: true,
      min: 1
    },
    actual: {
      type: Number,
      default: null
    },
    attendees: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['organizer', 'instructor', 'assistant', 'participant', 'guest'],
        default: 'participant'
      },
      attendance: {
        type: String,
        enum: ['pending', 'confirmed', 'attended', 'absent'],
        default: 'pending'
      }
    }]
  },
  resources: {
    equipment: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory'
      },
      quantity: Number,
      status: {
        type: String,
        enum: ['requested', 'approved', 'ready', 'collected', 'returned'],
        default: 'requested'
      }
    }],
    software: [{
      name: String,
      licenses: Number
    }],
    specialRequirements: [String]
  },
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    comments: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  checkIn: {
    time: Date,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  checkOut: {
    time: Date,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'issues'],
      default: 'good'
    },
    issues: [String],
    notes: String
  },
  cancellation: {
    cancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String
  },
  conflicts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  notifications: {
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date,
    confirmationSent: {
      type: Boolean,
      default: false
    },
    confirmationSentAt: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date,
    issues: [{
      category: String,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      }
    }]
  },
  billing: {
    cost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paymentMethod: String,
    paymentDate: Date,
    invoiceNumber: String
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  history: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    details: String
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ lab: 1, date: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ campus: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'approval.status': 1 });
bookingSchema.index({ date: 1, 'timeSlot.start': 1, 'timeSlot.end': 1 });

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.bookingId = `BK-${year}${month}${day}-${random}`;
  }
  
  // Calculate duration
  if (this.timeSlot.start && this.timeSlot.end) {
    const start = new Date(`2000-01-01 ${this.timeSlot.start}`);
    const end = new Date(`2000-01-01 ${this.timeSlot.end}`);
    this.timeSlot.duration = (end - start) / (1000 * 60); // duration in minutes
  }
  
  next();
});

// Virtual for booking duration in hours
bookingSchema.virtual('durationInHours').get(function() {
  return this.timeSlot.duration ? (this.timeSlot.duration / 60).toFixed(2) : 0;
});

// Method to check if booking is active
bookingSchema.methods.isActive = function() {
  return ['confirmed', 'in-progress'].includes(this.status);
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDate = new Date(this.date);
  const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
  
  return hoursDiff > 2 && !['completed', 'cancelled'].includes(this.status);
};

// Method to check for conflicts
bookingSchema.methods.hasConflict = async function() {
  const Booking = mongoose.model('Booking');
  
  const conflicts = await Booking.find({
    lab: this.lab,
    date: this.date,
    _id: { $ne: this._id },
    status: { $in: ['confirmed', 'in-progress'] },
    $or: [
      {
        'timeSlot.start': { $lt: this.timeSlot.end },
        'timeSlot.end': { $gt: this.timeSlot.start }
      }
    ]
  });
  
  return conflicts.length > 0;
};

// Method to approve booking
bookingSchema.methods.approve = async function(userId, comments) {
  this.approval.status = 'approved';
  this.approval.approvedBy = userId;
  this.approval.approvedAt = new Date();
  this.approval.comments = comments;
  this.status = 'confirmed';
  
  this.history.push({
    action: 'approved',
    performedBy: userId,
    performedAt: new Date(),
    details: comments || 'Booking approved'
  });
  
  return await this.save();
};

// Method to reject booking
bookingSchema.methods.reject = async function(userId, reason) {
  this.approval.status = 'rejected';
  this.approval.approvedBy = userId;
  this.approval.approvedAt = new Date();
  this.approval.rejectionReason = reason;
  this.status = 'cancelled';
  
  this.history.push({
    action: 'rejected',
    performedBy: userId,
    performedAt: new Date(),
    details: reason
  });
  
  return await this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = async function(userId, reason) {
  this.cancellation.cancelled = true;
  this.cancellation.cancelledBy = userId;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.reason = reason;
  this.status = 'cancelled';
  
  this.history.push({
    action: 'cancelled',
    performedBy: userId,
    performedAt: new Date(),
    details: reason
  });
  
  return await this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
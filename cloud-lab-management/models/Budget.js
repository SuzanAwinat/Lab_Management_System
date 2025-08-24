const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budgetId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['annual', 'quarterly', 'monthly', 'project', 'emergency', 'special'],
    required: true
  },
  scope: {
    type: String,
    enum: ['organization', 'campus', 'department', 'lab', 'project'],
    required: true
  },
  entity: {
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus'
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab'
    },
    department: String,
    project: String
  },
  fiscalYear: {
    type: String,
    required: true
  },
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    quarter: Number,
    month: Number
  },
  allocation: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    categories: {
      equipment: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      software: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      maintenance: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      supplies: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      personnel: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      utilities: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      training: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      other: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        committed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      }
    }
  },
  transactions: [{
    transactionId: String,
    date: Date,
    category: String,
    subcategory: String,
    description: String,
    vendor: String,
    amount: Number,
    type: {
      type: String,
      enum: ['expense', 'refund', 'adjustment', 'transfer'],
      default: 'expense'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    reference: {
      purchaseOrder: String,
      invoice: String,
      receipt: String
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    notes: String
  }],
  approvals: {
    budget: {
      status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'revised'],
        default: 'draft'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date,
      comments: String
    },
    levels: [{
      level: Number,
      role: String,
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      date: Date,
      comments: String
    }]
  },
  metrics: {
    totalSpent: {
      type: Number,
      default: 0
    },
    totalCommitted: {
      type: Number,
      default: 0
    },
    totalAvailable: {
      type: Number,
      default: 0
    },
    utilizationRate: {
      type: Number,
      default: 0
    },
    burnRate: {
      type: Number,
      default: 0
    },
    projectedSpend: {
      type: Number,
      default: 0
    },
    variance: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  alerts: {
    thresholds: {
      warning: {
        type: Number,
        default: 80
      },
      critical: {
        type: Number,
        default: 95
      }
    },
    current: [{
      type: {
        type: String,
        enum: ['warning', 'critical', 'overspent'],
      },
      category: String,
      message: String,
      triggeredAt: Date,
      acknowledged: {
        type: Boolean,
        default: false
      },
      acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  forecasting: {
    method: {
      type: String,
      enum: ['linear', 'seasonal', 'historical', 'ml-based'],
      default: 'linear'
    },
    projections: [{
      month: String,
      projected: Number,
      confidence: Number,
      factors: [String]
    }],
    recommendations: [{
      category: String,
      action: String,
      impact: Number,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },
  reporting: {
    schedule: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    lastReport: Date,
    nextReport: Date
  },
  audit: {
    isAudited: {
      type: Boolean,
      default: false
    },
    lastAudit: Date,
    auditor: String,
    findings: [{
      category: String,
      issue: String,
      severity: String,
      recommendation: String,
      status: String
    }]
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'frozen', 'overspent'],
    default: 'active'
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
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
budgetSchema.index({ budgetId: 1 });
budgetSchema.index({ fiscalYear: 1, type: 1 });
budgetSchema.index({ 'entity.campus': 1 });
budgetSchema.index({ 'entity.lab': 1 });
budgetSchema.index({ status: 1 });

// Generate budget ID before saving
budgetSchema.pre('save', async function(next) {
  if (!this.budgetId) {
    const prefix = this.type.substring(0, 2).toUpperCase();
    const year = this.fiscalYear;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.budgetId = `BDG-${prefix}-${year}-${random}`;
  }
  
  // Calculate metrics
  this.calculateMetrics();
  
  // Check for alerts
  this.checkAlerts();
  
  next();
});

// Method to calculate metrics
budgetSchema.methods.calculateMetrics = function() {
  let totalSpent = 0;
  let totalCommitted = 0;
  
  // Calculate totals from categories
  for (const category in this.allocation.categories) {
    totalSpent += this.allocation.categories[category].spent || 0;
    totalCommitted += this.allocation.categories[category].committed || 0;
  }
  
  this.metrics.totalSpent = totalSpent;
  this.metrics.totalCommitted = totalCommitted;
  this.metrics.totalAvailable = this.allocation.total - totalSpent - totalCommitted;
  this.metrics.utilizationRate = this.allocation.total > 0 
    ? ((totalSpent / this.allocation.total) * 100).toFixed(2) 
    : 0;
  
  // Calculate burn rate (monthly average)
  const monthsElapsed = Math.max(1, Math.floor((new Date() - this.period.start) / (1000 * 60 * 60 * 24 * 30)));
  this.metrics.burnRate = totalSpent / monthsElapsed;
  
  // Project spend for remaining period
  const totalMonths = Math.floor((this.period.end - this.period.start) / (1000 * 60 * 60 * 24 * 30));
  this.metrics.projectedSpend = this.metrics.burnRate * totalMonths;
  
  // Calculate variance
  this.metrics.variance = this.allocation.total - this.metrics.projectedSpend;
  
  this.metrics.lastUpdated = new Date();
};

// Method to check alerts
budgetSchema.methods.checkAlerts = function() {
  const utilizationRate = parseFloat(this.metrics.utilizationRate);
  
  // Clear existing alerts
  this.alerts.current = this.alerts.current.filter(alert => alert.acknowledged);
  
  // Check for overspent
  if (this.metrics.totalSpent > this.allocation.total) {
    this.alerts.current.push({
      type: 'overspent',
      message: `Budget overspent by ${this.metrics.totalSpent - this.allocation.total}`,
      triggeredAt: new Date()
    });
    this.status = 'overspent';
  }
  // Check for critical threshold
  else if (utilizationRate >= this.alerts.thresholds.critical) {
    this.alerts.current.push({
      type: 'critical',
      message: `Budget utilization at ${utilizationRate}% - Critical threshold reached`,
      triggeredAt: new Date()
    });
  }
  // Check for warning threshold
  else if (utilizationRate >= this.alerts.thresholds.warning) {
    this.alerts.current.push({
      type: 'warning',
      message: `Budget utilization at ${utilizationRate}% - Warning threshold reached`,
      triggeredAt: new Date()
    });
  }
  
  // Check category-specific alerts
  for (const category in this.allocation.categories) {
    const cat = this.allocation.categories[category];
    if (cat.allocated > 0) {
      const catUtilization = (cat.spent / cat.allocated) * 100;
      if (catUtilization >= this.alerts.thresholds.critical) {
        this.alerts.current.push({
          type: 'critical',
          category: category,
          message: `${category} budget at ${catUtilization.toFixed(2)}% utilization`,
          triggeredAt: new Date()
        });
      }
    }
  }
};

// Method to add transaction
budgetSchema.methods.addTransaction = async function(transaction) {
  transaction.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  this.transactions.push(transaction);
  
  // Update category spending
  if (transaction.status === 'completed' && transaction.type === 'expense') {
    const category = transaction.category;
    if (this.allocation.categories[category]) {
      this.allocation.categories[category].spent += transaction.amount;
    }
  }
  
  // Recalculate metrics
  this.calculateMetrics();
  this.checkAlerts();
  
  return await this.save();
};

// Method to approve budget
budgetSchema.methods.approveBudget = async function(userId, comments) {
  this.approvals.budget.status = 'approved';
  this.approvals.budget.approvedBy = userId;
  this.approvals.budget.approvedAt = new Date();
  this.approvals.budget.comments = comments;
  this.status = 'active';
  
  this.history.push({
    action: 'budget_approved',
    performedBy: userId,
    performedAt: new Date(),
    details: { comments }
  });
  
  return await this.save();
};

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function() {
  return this.metrics.totalAvailable;
});

// Virtual for days remaining in period
budgetSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.period.end);
  return Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
});

module.exports = mongoose.model('Budget', budgetSchema);
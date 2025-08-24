const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campusId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'campuses',
      key: 'id'
    }
  },
  fiscalYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('equipment', 'maintenance', 'consumables', 'utilities', 'personnel', 'training', 'other'),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  allocatedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  spentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  committedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Amount committed but not yet spent'
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'budgets',
  indexes: [
    {
      fields: ['campusId']
    },
    {
      fields: ['fiscalYear']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeSave: (budget) => {
      // Calculate remaining amount
      budget.remainingAmount = budget.allocatedAmount - budget.spentAmount - budget.committedAmount;
      budget.lastUpdated = new Date();
    }
  }
});

// Instance methods
Budget.prototype.getUtilizationPercentage = function() {
  if (this.allocatedAmount === 0) return 0;
  return ((this.spentAmount + this.committedAmount) / this.allocatedAmount) * 100;
};

Budget.prototype.isOverBudget = function() {
  return this.spentAmount > this.allocatedAmount;
};

Budget.prototype.isNearLimit = function(threshold = 0.8) {
  const utilization = this.getUtilizationPercentage();
  return utilization >= (threshold * 100);
};

Budget.prototype.canSpend = function(amount) {
  return this.remainingAmount >= amount;
};

Budget.prototype.addExpense = function(amount) {
  this.spentAmount += amount;
  return this.save();
};

Budget.prototype.addCommitment = function(amount) {
  this.committedAmount += amount;
  return this.save();
};

Budget.prototype.releaseCommitment = function(amount) {
  this.committedAmount = Math.max(0, this.committedAmount - amount);
  return this.save();
};

Budget.prototype.getStatus = function() {
  if (this.isOverBudget()) return 'over_budget';
  if (this.isNearLimit(0.9)) return 'critical';
  if (this.isNearLimit(0.8)) return 'warning';
  if (this.isNearLimit(0.6)) return 'moderate';
  return 'healthy';
};

module.exports = Budget;
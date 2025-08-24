const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  category: {
    type: DataTypes.ENUM('computer', 'scientific', 'safety', 'furniture', 'consumable', 'other'),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  labId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'labs',
      key: 'id'
    }
  },
  campusId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'campuses',
      key: 'id'
    }
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  warrantyExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  currentValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'piece'
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'out_of_order', 'retired'),
    allowNull: false,
    defaultValue: 'available'
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
    allowNull: false,
    defaultValue: 'good'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Specific location within lab or storage'
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Technical specifications of the equipment'
  },
  maintenanceHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of maintenance records'
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maintenanceInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Days between maintenance'
  },
  isCalibrated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  calibrationExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  safetyNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userManual: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL to user manual'
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of image URLs'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'equipment',
  indexes: [
    {
      fields: ['labId']
    },
    {
      fields: ['campusId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['serialNumber']
    }
  ]
});

// Instance methods
Equipment.prototype.isAvailableForUse = function() {
  return this.status === 'available' && this.condition !== 'critical';
};

Equipment.prototype.needsMaintenance = function() {
  if (!this.nextMaintenance) return false;
  const today = new Date();
  const maintenanceDate = new Date(this.nextMaintenance);
  return today >= maintenanceDate;
};

Equipment.prototype.isUnderWarranty = function() {
  if (!this.warrantyExpiry) return false;
  const today = new Date();
  const warrantyDate = new Date(this.warrantyExpiry);
  return today <= warrantyDate;
};

Equipment.prototype.calculateDepreciation = function() {
  if (!this.purchasePrice || !this.purchaseDate) return null;
  
  const today = new Date();
  const purchaseDate = new Date(this.purchaseDate);
  const yearsSincePurchase = (today - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  
  // Simple linear depreciation (5% per year)
  const depreciationRate = 0.05;
  const depreciation = this.purchasePrice * depreciationRate * yearsSincePurchase;
  
  return Math.max(0, this.purchasePrice - depreciation);
};

Equipment.prototype.getMaintenanceStatus = function() {
  if (this.needsMaintenance()) return 'overdue';
  if (this.nextMaintenance) {
    const daysUntilMaintenance = Math.ceil((new Date(this.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilMaintenance <= 7) return 'due_soon';
    if (daysUntilMaintenance <= 30) return 'approaching';
  }
  return 'ok';
};

module.exports = Equipment;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lab = sequelize.define('Lab', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  campusId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'campuses',
      key: 'id'
    }
  },
  building: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  labType: {
    type: DataTypes.ENUM('computer', 'chemistry', 'biology', 'physics', 'engineering', 'medical', 'research', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  equipment: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'List of available equipment in the lab'
  },
  facilities: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Available facilities like internet, air conditioning, etc.'
  },
  operatingHours: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maintenanceStatus: {
    type: DataTypes.ENUM('operational', 'maintenance', 'out_of_order'),
    defaultValue: 'operational'
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  safetyRequirements: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Safety requirements and certifications needed'
  },
  bookingRules: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Rules for booking this lab'
  },
  costPerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of image URLs for the lab'
  }
}, {
  tableName: 'labs',
  indexes: [
    {
      fields: ['campusId']
    },
    {
      fields: ['labType']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['maintenanceStatus']
    }
  ]
});

// Instance methods
Lab.prototype.getFullLocation = function() {
  return `${this.building}, Floor ${this.floor || 'G'}, Room ${this.roomNumber}`;
};

Lab.prototype.isAvailable = function(date, startTime, endTime) {
  // This would be implemented with booking logic
  return true;
};

Lab.prototype.getOperatingHoursForDay = function(day) {
  const dayLower = day.toLowerCase();
  return this.operatingHours[dayLower] || null;
};

Lab.prototype.isWithinOperatingHours = function(time) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  
  const hours = this.getOperatingHoursForDay(day);
  if (!hours) return false;
  
  return currentTime >= hours.open && currentTime <= hours.close;
};

module.exports = Lab;
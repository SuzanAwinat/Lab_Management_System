const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  type: {
    type: DataTypes.ENUM('equipment', 'consumable', 'tool', 'chemical', 'glassware', 'other'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
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
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'piece'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'USD'
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged'),
    allowNull: false,
    defaultValue: 'available'
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
    allowNull: false,
    defaultValue: 'good'
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maintenanceCycle: {
    type: DataTypes.INTEGER, // days
    allowNull: true
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['campusId']
    },
    {
      fields: ['labId']
    }
  ]
});

// Associations
Inventory.associate = (models) => {
  Inventory.belongsTo(models.Campus, {
    foreignKey: 'campusId',
    as: 'campus'
  });
  
  Inventory.belongsTo(models.Lab, {
    foreignKey: 'labId',
    as: 'lab'
  });
  
  Inventory.belongsTo(models.User, {
    foreignKey: 'assignedTo',
    as: 'assignedUser'
  });
  
  Inventory.hasMany(models.Booking, {
    foreignKey: 'inventoryId',
    as: 'bookings'
  });
};

module.exports = Inventory;
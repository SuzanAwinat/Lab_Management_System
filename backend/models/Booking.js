const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  labId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'labs',
      key: 'id'
    }
  },
  equipmentIds: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of equipment IDs for equipment-only bookings'
  },
  campusId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'campuses',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed', 'no_show'),
    allowNull: false,
    defaultValue: 'pending'
  },
  bookingType: {
    type: DataTypes.ENUM('lab', 'equipment', 'lab_and_equipment'),
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('class', 'research', 'project', 'maintenance', 'event', 'other'),
    allowNull: false
  },
  attendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  instructor: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  courseCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  specialRequirements: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Special requirements or setup needs'
  },
  setupTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Setup time needed in minutes'
  },
  cleanupTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Cleanup time needed in minutes'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'waived', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  approvalBy: {
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
  approvalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of attachment URLs'
  }
}, {
  tableName: 'bookings',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['labId']
    },
    {
      fields: ['campusId']
    },
    {
      fields: ['startDateTime']
    },
    {
      fields: ['status']
    },
    {
      fields: ['bookingType']
    }
  ]
});

// Instance methods
Booking.prototype.isActive = function() {
  const now = new Date();
  return this.startDateTime <= now && this.endDateTime >= now && this.status === 'approved';
};

Booking.prototype.isUpcoming = function() {
  const now = new Date();
  return this.startDateTime > now && this.status === 'approved';
};

Booking.prototype.isPast = function() {
  const now = new Date();
  return this.endDateTime < now;
};

Booking.prototype.getTotalCost = function() {
  if (this.cost) return this.cost;
  
  // Calculate cost based on duration and lab/equipment rates
  const hours = this.duration / 60;
  // This would be implemented with actual rate calculation logic
  return 0;
};

Booking.prototype.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDateTime - now) / (1000 * 60 * 60);
  return this.status === 'approved' && hoursUntilStart > 24;
};

Booking.prototype.getConflictCheckQuery = function() {
  return {
    where: {
      labId: this.labId,
      status: ['approved', 'pending'],
      [sequelize.Op.or]: [
        {
          startDateTime: {
            [sequelize.Op.lt]: this.endDateTime
          },
          endDateTime: {
            [sequelize.Op.gt]: this.startDateTime
          }
        }
      ]
    }
  };
};

Booking.prototype.sendReminder = function() {
  // This would be implemented with email/notification logic
  this.reminderSent = true;
  this.reminderDate = new Date();
  return this.save();
};

module.exports = Booking;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Campus = sequelize.define('Campus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 10],
      isUppercase: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'UTC'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total capacity of the campus'
  },
  establishedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  coordinates: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true,
    comment: 'GPS coordinates for mapping'
  }
}, {
  tableName: 'campuses',
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['city', 'state']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods
Campus.prototype.getFullAddress = function() {
  const parts = [this.address, this.city, this.state, this.country];
  if (this.postalCode) parts.splice(3, 0, this.postalCode);
  return parts.filter(Boolean).join(', ');
};

Campus.prototype.getContactInfo = function() {
  const contacts = {};
  if (this.phone) contacts.phone = this.phone;
  if (this.email) contacts.email = this.email;
  if (this.website) contacts.website = this.website;
  return contacts;
};

module.exports = Campus;
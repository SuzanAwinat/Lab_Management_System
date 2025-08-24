const { Sequelize } = require('sequelize');
const Redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'clms_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Redis configuration
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || null
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize Redis connection
const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connection established successfully.');
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

// Export models
const User = require('../models/User');
const Campus = require('../models/Campus');
const Lab = require('../models/Lab');
const Equipment = require('../models/Equipment');
const Inventory = require('../models/Inventory');
const Booking = require('../models/Booking');
const Budget = require('../models/Budget');

// Define associations
User.associate({ Campus, Lab, Equipment, Inventory, Booking, Budget });
Campus.associate({ User, Lab, Equipment, Inventory, Booking, Budget });
Lab.associate({ User, Campus, Equipment, Inventory, Booking, Budget });
Equipment.associate({ User, Campus, Lab, Inventory, Booking, Budget });
Inventory.associate({ User, Campus, Lab, Equipment, Booking, Budget });
Booking.associate({ User, Campus, Lab, Equipment, Inventory, Budget });
Budget.associate({ User, Campus, Lab, Equipment, Inventory, Booking });

module.exports = {
  sequelize,
  redisClient,
  testConnection,
  initRedis,
  models: {
    User,
    Campus,
    Lab,
    Equipment,
    Inventory,
    Booking,
    Budget
  }
};
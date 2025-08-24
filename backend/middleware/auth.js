const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');

// JWT Strategy for Passport
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);
    if (user && user.isActive) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission
      });
    }
    
    next();
  };
};

// Middleware to check if user can access campus-specific resources
const requireCampusAccess = (campusIdParam = 'campusId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admins can access all campuses
    if (req.user.role === 'admin') {
      return next();
    }
    
    const requestedCampusId = req.params[campusIdParam] || req.body[campusIdParam];
    
    if (!requestedCampusId) {
      return res.status(400).json({ error: 'Campus ID required' });
    }
    
    // Check if user has access to the requested campus
    if (req.user.campusId !== requestedCampusId) {
      return res.status(403).json({ 
        error: 'Access denied to this campus',
        userCampus: req.user.campusId,
        requestedCampus: requestedCampusId
      });
    }
    
    next();
  };
};

// Middleware to check if user can access their own resources
const requireOwnership = (resourceUserIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admins can access all resources
    if (req.user.role === 'admin') {
      return next();
    }
    
    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
    
    if (!resourceUserId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Check if user is accessing their own resource
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: 'Access denied to this resource',
        user: req.user.id,
        resource: resourceUserId
      });
    }
    
    next();
  };
};

// Rate limiting middleware for authentication endpoints
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireCampusAccess,
  requireOwnership,
  authRateLimit,
  passport
};
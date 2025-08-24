const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

// @route   GET /api/budget
// @desc    Get all budgets
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const budgets = await Budget.find().populate('entity.campus entity.lab');
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budgets' });
  }
});

module.exports = router;
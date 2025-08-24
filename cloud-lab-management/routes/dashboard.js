const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    res.json({ success: true, message: 'Dashboard endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
});

module.exports = router;
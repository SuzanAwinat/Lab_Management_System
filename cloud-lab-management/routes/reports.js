const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/reports/summary
// @desc    Get summary reports
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    res.json({ success: true, message: 'Reports endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating reports' });
  }
});

module.exports = router;
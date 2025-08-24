const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const { protect } = require('../middleware/auth');

// @route   GET /api/labs
// @desc    Get all labs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const labs = await Lab.find().populate('campus manager');
    res.json({ success: true, count: labs.length, data: labs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching labs' });
  }
});

module.exports = router;
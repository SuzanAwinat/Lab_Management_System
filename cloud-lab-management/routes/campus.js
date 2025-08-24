const express = require('express');
const router = express.Router();
const Campus = require('../models/Campus');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// @route   GET /api/campus
// @desc    Get all campuses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const campuses = await Campus.find()
      .populate('administrator', 'firstName lastName email')
      .sort('name');

    res.json({
      success: true,
      count: campuses.length,
      data: campuses
    });
  } catch (error) {
    console.error('Get campuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campuses'
    });
  }
});

// @route   GET /api/campus/:id
// @desc    Get single campus
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const campus = await Campus.findById(req.params.id)
      .populate('administrator', 'firstName lastName email')
      .populate('departments.head', 'firstName lastName email');

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found'
      });
    }

    res.json({
      success: true,
      data: campus
    });
  } catch (error) {
    console.error('Get campus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campus'
    });
  }
});

// @route   POST /api/campus
// @desc    Create new campus
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const campus = await Campus.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      data: campus
    });
  } catch (error) {
    console.error('Create campus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campus',
      error: error.message
    });
  }
});

// @route   PUT /api/campus/:id
// @desc    Update campus
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const campus = await Campus.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found'
      });
    }

    res.json({
      success: true,
      message: 'Campus updated successfully',
      data: campus
    });
  } catch (error) {
    console.error('Update campus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campus'
    });
  }
});

// @route   DELETE /api/campus/:id
// @desc    Delete campus
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const campus = await Campus.findByIdAndDelete(req.params.id);

    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus not found'
      });
    }

    res.json({
      success: true,
      message: 'Campus deleted successfully'
    });
  } catch (error) {
    console.error('Delete campus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campus'
    });
  }
});

module.exports = router;
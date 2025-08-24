const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Booking, Lab, Equipment, Inventory, User, Campus } = require('../config/database');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const moment = require('moment');

const router = express.Router();

// Validation middleware
const validateBooking = [
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('purpose').trim().isLength({ min: 1, max: 500 }),
  body('attendees').isInt({ min: 1 }).optional(),
  body('notes').trim().optional()
];

// Get all bookings with pagination and filtering
router.get('/', [
  query('page').isInt({ min: 1 }).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('status').isIn(['pending', 'approved', 'rejected', 'cancelled', 'completed']).optional(),
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('userId').isUUID().optional(),
  query('startDate').isISO8601().optional(),
  query('endDate').isISO8601().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      campusId,
      labId,
      userId,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [
      {
        model: Lab,
        as: 'lab',
        attributes: ['id', 'name', 'roomNumber', 'capacity'],
        include: [{
          model: Campus,
          as: 'campus',
          attributes: ['id', 'name', 'location']
        }]
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }
    ];

    // Build where clause
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;
    if (startDate) whereClause.startTime = { [Op.gte]: new Date(startDate) };
    if (endDate) whereClause.endTime = { [Op.lte]: new Date(endDate) };

    // Filter by campus/lab
    if (campusId || labId) {
      includeClause[0].where = {};
      if (campusId) includeClause[0].where.campusId = campusId;
      if (labId) includeClause[0].where.id = labId;
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startTime', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      bookings: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Lab,
          as: 'lab',
          attributes: ['id', 'name', 'roomNumber', 'capacity', 'description'],
          include: [{
            model: Campus,
            as: 'campus',
            attributes: ['id', 'name', 'location']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'type', 'status']
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'name', 'type', 'quantity', 'status']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new booking
router.post('/', validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      labId,
      equipmentIds,
      inventoryIds,
      startTime,
      endTime,
      purpose,
      attendees,
      notes
    } = req.body;

    // Validate time range
    const start = moment(startTime);
    const end = moment(endTime);
    
    if (start.isSameOrAfter(end)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (start.isBefore(moment())) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Check lab availability
    if (labId) {
      const conflictingLabBooking = await Booking.findOne({
        where: {
          labId,
          status: { [Op.in]: ['pending', 'approved'] },
          [Op.or]: [
            {
              startTime: { [Op.lt]: end.toDate() },
              endTime: { [Op.gt]: start.toDate() }
            }
          ]
        }
      });

      if (conflictingLabBooking) {
        return res.status(409).json({ 
          error: 'Lab is not available for the selected time period',
          conflictingBooking: conflictingLabBooking.id
        });
      }
    }

    // Check equipment availability
    if (equipmentIds && equipmentIds.length > 0) {
      for (const equipmentId of equipmentIds) {
        const conflictingEquipmentBooking = await Booking.findOne({
          where: {
            equipmentIds: { [Op.contains]: [equipmentId] },
            status: { [Op.in]: ['pending', 'approved'] },
            [Op.or]: [
              {
                startTime: { [Op.lt]: end.toDate() },
                endTime: { [Op.gt]: start.toDate() }
              }
            ]
          }
        });

        if (conflictingEquipmentBooking) {
          return res.status(409).json({ 
            error: `Equipment ${equipmentId} is not available for the selected time period`,
            conflictingBooking: conflictingEquipmentBooking.id
          });
        }
      }
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.userId,
      labId,
      equipmentIds: equipmentIds || [],
      inventoryIds: inventoryIds || [],
      startTime: start.toDate(),
      endTime: end.toDate(),
      purpose,
      attendees,
      notes,
      status: 'pending'
    });

    logger.info(`New booking created: ${booking.id} by user: ${req.user.userId}`);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking
router.put('/:id', validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user can modify this booking
    if (booking.userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'lab_manager') {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }

    // Check if booking can be modified
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot modify completed or cancelled bookings' });
    }

    // Validate time range if updating
    if (updateData.startTime || updateData.endTime) {
      const start = moment(updateData.startTime || booking.startTime);
      const end = moment(updateData.endTime || booking.endTime);
      
      if (start.isSameOrAfter(end)) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      if (start.isBefore(moment())) {
        return res.status(400).json({ error: 'Cannot book in the past' });
      }

      // Check for conflicts with updated time
      const conflictingBooking = await Booking.findOne({
        where: {
          id: { [Op.ne]: id },
          labId: updateData.labId || booking.labId,
          status: { [Op.in]: ['pending', 'approved'] },
          [Op.or]: [
            {
              startTime: { [Op.lt]: end.toDate() },
              endTime: { [Op.gt]: start.toDate() }
            }
          ]
        }
      });

      if (conflictingBooking) {
        return res.status(409).json({ 
          error: 'Lab is not available for the selected time period',
          conflictingBooking: conflictingBooking.id
        });
      }
    }

    await booking.update(updateData);

    logger.info(`Booking updated: ${id} by user: ${req.user.userId}`);

    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', [
  body('reason').trim().isLength({ min: 1, max: 500 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user can cancel this booking
    if (booking.userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'lab_manager') {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled bookings' });
    }

    if (moment(booking.startTime).isBefore(moment())) {
      return res.status(400).json({ error: 'Cannot cancel past bookings' });
    }

    await booking.update({
      status: 'cancelled',
      notes: reason ? `${booking.notes || ''}\n[${new Date().toISOString()}] Cancelled: ${reason}`.trim() : booking.notes
    });

    logger.info(`Booking cancelled: ${id} by user: ${req.user.userId}`);

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject booking (for lab managers and admins)
router.patch('/:id/status', [
  body('status').isIn(['approved', 'rejected']),
  body('reason').trim().isLength({ min: 1, max: 500 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.role !== 'lab_manager') {
      return res.status(403).json({ error: 'Not authorized to change booking status' });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only change status of pending bookings' });
    }

    await booking.update({
      status,
      notes: reason ? `${booking.notes || ''}\n[${new Date().toISOString()}] ${status} by ${req.user.firstName} ${req.user.lastName}: ${reason}`.trim() : booking.notes
    });

    logger.info(`Booking ${status}: ${id} by user: ${req.user.userId}`);

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    logger.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete booking
router.patch('/:id/complete', [
  body('notes').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user can complete this booking
    if (booking.userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'lab_manager') {
      return res.status(403).json({ error: 'Not authorized to complete this booking' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ error: 'Can only complete approved bookings' });
    }

    if (moment(booking.endTime).isAfter(moment())) {
      return res.status(400).json({ error: 'Cannot complete booking before end time' });
    }

    await booking.update({
      status: 'completed',
      notes: notes ? `${booking.notes || ''}\n[${new Date().toISOString()}] Completed: ${notes}`.trim() : booking.notes
    });

    logger.info(`Booking completed: ${id} by user: ${req.user.userId}`);

    res.json({
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    logger.error('Complete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking conflicts
router.post('/check-conflicts', [
  body('labId').isUUID().optional(),
  body('equipmentIds').isArray().optional(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('excludeBookingId').isUUID().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { labId, equipmentIds, startTime, endTime, excludeBookingId } = req.body;

    const start = moment(startTime);
    const end = moment(endTime);

    if (start.isSameOrAfter(end)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const conflicts = [];

    // Check lab conflicts
    if (labId) {
      const labConflicts = await Booking.findAll({
        where: {
          labId,
          id: excludeBookingId ? { [Op.ne]: excludeBookingId } : undefined,
          status: { [Op.in]: ['pending', 'approved'] },
          [Op.or]: [
            {
              startTime: { [Op.lt]: end.toDate() },
              endTime: { [Op.gt]: start.toDate() }
            }
          ]
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      conflicts.push(...labConflicts.map(conflict => ({
        type: 'lab',
        booking: conflict,
        conflictType: 'time_overlap'
      })));
    }

    // Check equipment conflicts
    if (equipmentIds && equipmentIds.length > 0) {
      for (const equipmentId of equipmentIds) {
        const equipmentConflicts = await Booking.findAll({
          where: {
            equipmentIds: { [Op.contains]: [equipmentId] },
            id: excludeBookingId ? { [Op.ne]: excludeBookingId } : undefined,
            status: { [Op.in]: ['pending', 'approved'] },
            [Op.or]: [
              {
                startTime: { [Op.lt]: end.toDate() },
                endTime: { [Op.gt]: start.toDate() }
              }
            ]
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        });

        conflicts.push(...equipmentConflicts.map(conflict => ({
          type: 'equipment',
          equipmentId,
          booking: conflict,
          conflictType: 'time_overlap'
        })));
      }
    }

    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts
    });
  } catch (error) {
    logger.error('Check conflicts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's upcoming bookings
router.get('/user/upcoming', async (req, res) => {
  try {
    const upcomingBookings = await Booking.findAll({
      where: {
        userId: req.user.userId,
        status: { [Op.in]: ['pending', 'approved'] },
        startTime: { [Op.gte]: new Date() }
      },
      include: [
        {
          model: Lab,
          as: 'lab',
          attributes: ['id', 'name', 'roomNumber'],
          include: [{
            model: Campus,
            as: 'campus',
            attributes: ['name']
          }]
        }
      ],
      order: [['startTime', 'ASC']],
      limit: 10
    });

    res.json({ upcomingBookings });
  } catch (error) {
    logger.error('Get upcoming bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    const stats = await Promise.all([
      // Total bookings
      Booking.count(),
      
      // Today's bookings
      Booking.count({
        where: {
          startTime: { [Op.gte]: today.toDate() },
          endTime: { [Op.lt]: moment().endOf('day').toDate() }
        }
      }),
      
      // This week's bookings
      Booking.count({
        where: {
          startTime: { [Op.gte]: thisWeek.toDate() }
        }
      }),
      
      // This month's bookings
      Booking.count({
        where: {
          startTime: { [Op.gte]: thisMonth.toDate() }
        }
      }),
      
      // Pending approvals
      Booking.count({
        where: { status: 'pending' }
      }),
      
      // Status breakdown
      Booking.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })
    ]);

    const [total, today, thisWeek, thisMonth, pending, statusBreakdown] = stats;

    res.json({
      summary: {
        total,
        today,
        thisWeek,
        thisMonth,
        pending
      },
      statusBreakdown
    });
  } catch (error) {
    logger.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
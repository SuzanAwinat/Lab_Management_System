const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Inventory, Campus, Lab, User } = require('../config/database');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

const router = express.Router();

// Validation middleware
const validateInventory = [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('type').isIn(['equipment', 'consumable', 'tool', 'chemical', 'glassware', 'other']),
  body('category').trim().isLength({ min: 1, max: 100 }),
  body('quantity').isInt({ min: 0 }),
  body('cost').isFloat({ min: 0 }).optional(),
  body('campusId').isUUID().optional(),
  body('labId').isUUID().optional()
];

// Get all inventory items with pagination and filtering
router.get('/', [
  query('page').isInt({ min: 1 }).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('type').isIn(['equipment', 'consumable', 'tool', 'chemical', 'glassware', 'other']).optional(),
  query('category').trim().optional(),
  query('status').isIn(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']).optional(),
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('search').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      type,
      category,
      status,
      campusId,
      labId,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [
      {
        model: Campus,
        as: 'campus',
        attributes: ['id', 'name', 'location']
      },
      {
        model: Lab,
        as: 'lab',
        attributes: ['id', 'name', 'roomNumber']
      },
      {
        model: User,
        as: 'assignedUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ];

    // Build where clause
    if (type) whereClause.type = type;
    if (category) whereClause.category = { [Op.iLike]: `%${category}%` };
    if (status) whereClause.status = status;
    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    whereClause.isActive = true;

    const { count, rows } = await Inventory.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      items: rows,
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
    logger.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Inventory.findByPk(id, {
      include: [
        {
          model: Campus,
          as: 'campus',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Lab,
          as: 'lab',
          attributes: ['id', 'name', 'roomNumber']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ item });
  } catch (error) {
    logger.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new inventory item
router.post('/', validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventoryData = req.body;
    
    // Check if serial number is unique (if provided)
    if (inventoryData.serialNumber) {
      const existingItem = await Inventory.findOne({
        where: { serialNumber: inventoryData.serialNumber, isActive: true }
      });
      if (existingItem) {
        return res.status(400).json({ error: 'Serial number already exists' });
      }
    }

    const item = await Inventory.create(inventoryData);

    logger.info(`New inventory item created: ${item.name} by user: ${req.user.userId}`);

    res.status(201).json({
      message: 'Inventory item created successfully',
      item
    });
  } catch (error) {
    logger.error('Create inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory item
router.put('/:id', validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if serial number is unique (if being updated)
    if (updateData.serialNumber && updateData.serialNumber !== item.serialNumber) {
      const existingItem = await Inventory.findOne({
        where: { 
          serialNumber: updateData.serialNumber, 
          isActive: true,
          id: { [Op.ne]: id }
        }
      });
      if (existingItem) {
        return res.status(400).json({ error: 'Serial number already exists' });
      }
    }

    await item.update(updateData);

    logger.info(`Inventory item updated: ${item.name} by user: ${req.user.userId}`);

    res.json({
      message: 'Inventory item updated successfully',
      item
    });
  } catch (error) {
    logger.error('Update inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Soft delete
    await item.update({ isActive: false });

    logger.info(`Inventory item deleted: ${item.name} by user: ${req.user.userId}`);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    logger.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory status
router.patch('/:id/status', [
  body('status').isIn(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']),
  body('notes').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.update({ 
      status,
      notes: notes ? `${item.notes || ''}\n[${new Date().toISOString()}] Status changed to ${status}: ${notes}`.trim() : item.notes
    });

    logger.info(`Inventory status updated: ${item.name} to ${status} by user: ${req.user.userId}`);

    res.json({
      message: 'Status updated successfully',
      item
    });
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory quantity
router.patch('/:id/quantity', [
  body('quantity').isInt({ min: 0 }),
  body('operation').isIn(['add', 'subtract', 'set']),
  body('notes').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity, operation, notes } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    let newQuantity = item.quantity;
    switch (operation) {
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
    }

    await item.update({ 
      quantity: newQuantity,
      notes: notes ? `${item.notes || ''}\n[${new Date().toISOString()}] Quantity ${operation}ed by ${quantity}: ${notes}`.trim() : item.notes
    });

    logger.info(`Inventory quantity updated: ${item.name} to ${newQuantity} by user: ${req.user.userId}`);

    res.json({
      message: 'Quantity updated successfully',
      item
    });
  } catch (error) {
    logger.error('Update quantity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schedule maintenance
router.post('/:id/maintenance', [
  body('maintenanceDate').isISO8601(),
  body('maintenanceType').isIn(['preventive', 'corrective', 'calibration', 'inspection']),
  body('description').trim().isLength({ min: 1 }),
  body('estimatedCost').isFloat({ min: 0 }).optional(),
  body('technician').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { maintenanceDate, maintenanceType, description, estimatedCost, technician } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Update maintenance schedule
    await item.update({
      nextMaintenance: new Date(maintenanceDate),
      status: 'maintenance',
      notes: `${item.notes || ''}\n[${new Date().toISOString()}] Maintenance scheduled: ${maintenanceType} - ${description}${technician ? ` (Technician: ${technician})` : ''}${estimatedCost ? ` (Est. Cost: $${estimatedCost})` : ''}`.trim()
    });

    logger.info(`Maintenance scheduled for: ${item.name} by user: ${req.user.userId}`);

    res.json({
      message: 'Maintenance scheduled successfully',
      item
    });
  } catch (error) {
    logger.error('Schedule maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete maintenance
router.post('/:id/maintenance/complete', [
  body('actualCost').isFloat({ min: 0 }).optional(),
  body('notes').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { actualCost, notes } = req.body;

    const item = await Inventory.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Calculate next maintenance date
    const nextMaintenance = item.maintenanceCycle ? 
      new Date(Date.now() + item.maintenanceCycle * 24 * 60 * 60 * 1000) : null;

    await item.update({
      lastMaintenance: new Date(),
      nextMaintenance,
      status: 'available',
      notes: `${item.notes || ''}\n[${new Date().toISOString()}] Maintenance completed${actualCost ? ` (Cost: $${actualCost})` : ''}${notes ? `: ${notes}` : ''}`.trim()
    });

    logger.info(`Maintenance completed for: ${item.name} by user: ${req.user.userId}`);

    res.json({
      message: 'Maintenance completed successfully',
      item
    });
  } catch (error) {
    logger.error('Complete maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inventory statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Inventory.findAll({
      where: { isActive: true },
      attributes: [
        'type',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'totalValue']
      ],
      group: ['type', 'status']
    });

    const totalItems = await Inventory.count({ where: { isActive: true } });
    const totalValue = await Inventory.sum('cost', { where: { isActive: true } });
    const lowStock = await Inventory.count({
      where: {
        isActive: true,
        quantity: { [Op.lte]: 5 }
      }
    });
    const maintenanceDue = await Inventory.count({
      where: {
        isActive: true,
        nextMaintenance: { [Op.lte]: new Date() }
      }
    });

    res.json({
      stats,
      summary: {
        totalItems,
        totalValue: totalValue || 0,
        lowStock,
        maintenanceDue
      }
    });
  } catch (error) {
    logger.error('Get inventory stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export inventory data
router.get('/export/csv', async (req, res) => {
  try {
    const items = await Inventory.findAll({
      where: { isActive: true },
      include: [
        { model: Campus, as: 'campus', attributes: ['name'] },
        { model: Lab, as: 'lab', attributes: ['name', 'roomNumber'] }
      ],
      order: [['name', 'ASC']]
    });

    // Convert to CSV format
    const csvData = items.map(item => ({
      Name: item.name,
      Type: item.type,
      Category: item.category,
      Quantity: item.quantity,
      Unit: item.unit,
      Cost: item.cost,
      Status: item.status,
      Condition: item.condition,
      Campus: item.campus?.name || '',
      Lab: item.lab?.name || '',
      Room: item.lab?.roomNumber || '',
      Location: item.location,
      PurchaseDate: item.purchaseDate,
      LastMaintenance: item.lastMaintenance,
      NextMaintenance: item.nextMaintenance
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
    
    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value || ''}"`).join(','))
    ].join('\n');

    res.send(csvString);
  } catch (error) {
    logger.error('Export inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
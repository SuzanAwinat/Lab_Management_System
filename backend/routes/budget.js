const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Budget, Campus, Lab, User, Inventory } = require('../config/database');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');
const moment = require('moment');

const router = express.Router();

// Validation middleware
const validateBudget = [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('type').isIn(['allocation', 'expense', 'revenue', 'transfer']),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isLength({ min: 3, max: 3 }).optional(),
  body('fiscalYear').isInt({ min: 2000, max: 2100 }),
  body('category').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().optional()
];

// Get all budget entries with pagination and filtering
router.get('/', [
  query('page').isInt({ min: 1 }).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  query('type').isIn(['allocation', 'expense', 'revenue', 'transfer']).optional(),
  query('category').trim().optional(),
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('fiscalYear').isInt({ min: 2000, max: 2100 }).optional(),
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
      type,
      category,
      campusId,
      labId,
      fiscalYear,
      startDate,
      endDate
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
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ];

    // Build where clause
    if (type) whereClause.type = type;
    if (category) whereClause.category = { [Op.iLike]: `%${category}%` };
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;
    if (startDate) whereClause.date = { [Op.gte]: new Date(startDate) };
    if (endDate) whereClause.date = { [Op.lte]: new Date(endDate) };

    // Filter by campus/lab
    if (campusId || labId) {
      if (campusId) whereClause.campusId = campusId;
      if (labId) whereClause.labId = labId;
    }

    const { count, rows } = await Budget.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      budgetEntries: rows,
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
    logger.error('Get budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const budgetEntry = await Budget.findByPk(id, {
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
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!budgetEntry) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    res.json({ budgetEntry });
  } catch (error) {
    logger.error('Get budget entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new budget entry
router.post('/', validateBudget, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budgetData = {
      ...req.body,
      userId: req.user.userId,
      date: req.body.date || new Date(),
      currency: req.body.currency || 'USD'
    };

    const budgetEntry = await Budget.create(budgetData);

    logger.info(`New budget entry created: ${budgetEntry.name} by user: ${req.user.userId}`);

    res.status(201).json({
      message: 'Budget entry created successfully',
      budgetEntry
    });
  } catch (error) {
    logger.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget entry
router.put('/:id', validateBudget, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const budgetEntry = await Budget.findByPk(id);
    if (!budgetEntry) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    // Check if user can modify this entry
    if (budgetEntry.userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'lab_manager') {
      return res.status(403).json({ error: 'Not authorized to modify this budget entry' });
    }

    await budgetEntry.update(updateData);

    logger.info(`Budget entry updated: ${id} by user: ${req.user.userId}`);

    res.json({
      message: 'Budget entry updated successfully',
      budgetEntry
    });
  } catch (error) {
    logger.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete budget entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const budgetEntry = await Budget.findByPk(id);
    if (!budgetEntry) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    // Check if user can delete this entry
    if (budgetEntry.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this budget entry' });
    }

    await budgetEntry.destroy();

    logger.info(`Budget entry deleted: ${id} by user: ${req.user.userId}`);

    res.json({ message: 'Budget entry deleted successfully' });
  } catch (error) {
    logger.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget overview and summary
router.get('/overview/summary', [
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('fiscalYear').isInt({ min: 2000, max: 2100 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { campusId, labId, fiscalYear } = req.query;
    const whereClause = {};

    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;

    // Get current fiscal year if not specified
    if (!fiscalYear) {
      const currentMonth = moment().month() + 1;
      whereClause.fiscalYear = currentMonth >= 7 ? moment().year() + 1 : moment().year();
    }

    const summary = await Budget.findAll({
      where: whereClause,
      attributes: [
        'type',
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type', 'category']
    });

    // Calculate totals
    const totals = {
      allocations: 0,
      expenses: 0,
      revenue: 0,
      transfers: 0,
      netBudget: 0
    };

    summary.forEach(item => {
      const amount = parseFloat(item.dataValues.totalAmount);
      switch (item.type) {
        case 'allocation':
          totals.allocations += amount;
          break;
        case 'expense':
          totals.expenses += amount;
          break;
        case 'revenue':
          totals.revenue += amount;
          break;
        case 'transfer':
          totals.transfers += amount;
          break;
      }
    });

    totals.netBudget = totals.allocations + totals.revenue - totals.expenses + totals.transfers;

    res.json({
      summary,
      totals,
      fiscalYear: whereClause.fiscalYear
    });
  } catch (error) {
    logger.error('Get budget overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget trends over time
router.get('/trends/analysis', [
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('fiscalYear').isInt({ min: 2000, max: 2100 }).optional(),
  query('period').isIn(['monthly', 'quarterly', 'yearly']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { campusId, labId, fiscalYear, period = 'monthly' } = req.query;
    const whereClause = {};

    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;

    let dateFormat;
    let groupBy;
    
    switch (period) {
      case 'monthly':
        dateFormat = 'YYYY-MM';
        groupBy = [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'type'];
        break;
      case 'quarterly':
        dateFormat = 'YYYY-Q';
        groupBy = [sequelize.fn('DATE_TRUNC', 'quarter', sequelize.col('date')), 'type'];
        break;
      case 'yearly':
        dateFormat = 'YYYY';
        groupBy = [sequelize.fn('DATE_TRUNC', 'year', sequelize.col('date')), 'type'];
        break;
    }

    const trends = await Budget.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE_TRUNC', period === 'monthly' ? 'month' : period === 'quarterly' ? 'quarter' : 'year', sequelize.col('date')), 'period'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: groupBy,
      order: [[sequelize.fn('DATE_TRUNC', period === 'monthly' ? 'month' : period === 'quarterly' ? 'quarter' : 'year', sequelize.col('date')), 'ASC']]
    });

    res.json({ trends, period });
  } catch (error) {
    logger.error('Get budget trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget vs actual comparison
router.get('/comparison/budget-vs-actual', [
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('fiscalYear').isInt({ min: 2000, max: 2100 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { campusId, labId, fiscalYear } = req.query;
    const whereClause = {};

    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;

    // Get budget allocations
    const allocations = await Budget.findAll({
      where: { ...whereClause, type: 'allocation' },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'budgetedAmount']
      ],
      group: ['category']
    });

    // Get actual expenses
    const expenses = await Budget.findAll({
      where: { ...whereClause, type: 'expense' },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'actualAmount']
      ],
      group: ['category']
    });

    // Combine and calculate variances
    const comparison = allocations.map(allocation => {
      const expense = expenses.find(e => e.category === allocation.category);
      const actualAmount = expense ? parseFloat(expense.dataValues.actualAmount) : 0;
      const budgetedAmount = parseFloat(allocation.dataValues.budgetedAmount);
      const variance = budgetedAmount - actualAmount;
      const variancePercentage = budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;

      return {
        category: allocation.category,
        budgetedAmount,
        actualAmount,
        variance,
        variancePercentage,
        status: variance >= 0 ? 'under_budget' : 'over_budget'
      };
    });

    res.json({ comparison });
  } catch (error) {
    logger.error('Get budget comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create budget allocation
router.post('/allocation', [
  body('campusId').isUUID().optional(),
  body('labId').isUUID().optional(),
  body('category').trim().isLength({ min: 1, max: 100 }),
  body('amount').isFloat({ min: 0.01 }),
  body('fiscalYear').isInt({ min: 2000, max: 2100 }),
  body('description').trim().optional(),
  body('notes').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allocationData = {
      ...req.body,
      type: 'allocation',
      userId: req.user.userId,
      date: new Date(),
      currency: 'USD'
    };

    const allocation = await Budget.create(allocationData);

    logger.info(`New budget allocation created: ${allocation.category} by user: ${req.user.userId}`);

    res.status(201).json({
      message: 'Budget allocation created successfully',
      allocation
    });
  } catch (error) {
    logger.error('Create allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record expense
router.post('/expense', [
  body('campusId').isUUID().optional(),
  body('labId').isUUID().optional(),
  body('category').trim().isLength({ min: 1, max: 100 }),
  body('amount').isFloat({ min: 0.01 }),
  body('fiscalYear').isInt({ min: 2000, max: 2100 }),
  body('description').trim().optional(),
  body('invoiceNumber').trim().optional(),
  body('vendor').trim().optional(),
  body('paymentMethod').trim().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expenseData = {
      ...req.body,
      type: 'expense',
      userId: req.user.userId,
      date: new Date(),
      currency: 'USD'
    };

    const expense = await Budget.create(expenseData);

    logger.info(`New expense recorded: ${expense.category} by user: ${req.user.userId}`);

    res.status(201).json({
      message: 'Expense recorded successfully',
      expense
    });
  } catch (error) {
    logger.error('Record expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget alerts and warnings
router.get('/alerts/overview', [
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional()
], async (req, res) => {
  try {
    const { campusId, labId } = req.query;
    const whereClause = {};

    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;

    const currentYear = moment().month() >= 6 ? moment().year() + 1 : moment().year();
    whereClause.fiscalYear = currentYear;

    // Get allocations and expenses by category
    const [allocations, expenses] = await Promise.all([
      Budget.findAll({
        where: { ...whereClause, type: 'allocation' },
        attributes: [
          'category',
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAllocated']
        ],
        group: ['category']
      }),
      Budget.findAll({
        where: { ...whereClause, type: 'expense' },
        attributes: [
          'category',
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalSpent']
        ],
        group: ['category']
      })
    ]);

    const alerts = [];

    // Check for over-budget categories
    allocations.forEach(allocation => {
      const expense = expenses.find(e => e.category === allocation.category);
      const allocated = parseFloat(allocation.dataValues.totalAllocated);
      const spent = expense ? parseFloat(expense.dataValues.totalSpent) : 0;
      const remaining = allocated - spent;
      const usagePercentage = (spent / allocated) * 100;

      if (usagePercentage >= 90) {
        alerts.push({
          type: 'warning',
          category: allocation.category,
          message: `Budget usage at ${usagePercentage.toFixed(1)}%`,
          allocated,
          spent,
          remaining,
          usagePercentage
        });
      }

      if (usagePercentage >= 100) {
        alerts.push({
          type: 'critical',
          category: allocation.category,
          message: `Budget exceeded by ${Math.abs(remaining).toFixed(2)}`,
          allocated,
          spent,
          remaining,
          usagePercentage
        });
      }
    });

    res.json({ alerts });
  } catch (error) {
    logger.error('Get budget alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export budget data
router.get('/export/csv', [
  query('campusId').isUUID().optional(),
  query('labId').isUUID().optional(),
  query('fiscalYear').isInt({ min: 2000, max: 2100 }).optional(),
  query('startDate').isISO8601().optional(),
  query('endDate').isISO8601().optional()
], async (req, res) => {
  try {
    const { campusId, labId, fiscalYear, startDate, endDate } = req.query;
    const whereClause = {};

    if (campusId) whereClause.campusId = campusId;
    if (labId) whereClause.labId = labId;
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;
    if (startDate) whereClause.date = { [Op.gte]: new Date(startDate) };
    if (endDate) whereClause.date = { [Op.lte]: new Date(endDate) }

    const budgetEntries = await Budget.findAll({
      where: whereClause,
      include: [
        { model: Campus, as: 'campus', attributes: ['name'] },
        { model: Lab, as: 'lab', attributes: ['name', 'roomNumber'] },
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
      ],
      order: [['date', 'ASC']]
    });

    // Convert to CSV format
    const csvData = budgetEntries.map(entry => ({
      Date: moment(entry.date).format('YYYY-MM-DD'),
      Type: entry.type,
      Category: entry.category,
      Amount: entry.amount,
      Currency: entry.currency,
      FiscalYear: entry.fiscalYear,
      Campus: entry.campus?.name || '',
      Lab: entry.lab?.name || '',
      Room: entry.lab?.roomNumber || '',
      Description: entry.description,
      Notes: entry.notes,
      User: `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim()
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="budget_export.csv"');
    
    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value || ''}"`).join(','))
    ].join('\n');

    res.send(csvString);
  } catch (error) {
    logger.error('Export budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all expenses for user
router.get('/', async (req, res) => {
  try {
    const { category, month, year, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.userId };

    if (category) where.category = category;

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Title, amount and category are required' });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
        description: description || null,
        userId: req.userId,
      },
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const { title, amount, category, date, description } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        description: description !== undefined ? description : existing.description,
      },
    });

    res.json(expense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;

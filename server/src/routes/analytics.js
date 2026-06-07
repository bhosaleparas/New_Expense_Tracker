const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Monthly summary - total per month for past N months
router.get('/monthly', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const userId = req.userId;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: startDate } },
      select: { amount: true, date: true, category: true },
    });

    // Group by year-month
    const monthly = {};
    expenses.forEach(({ amount, date, category }) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { total: 0, month: key };
      monthly[key].total += amount;
    });

    const result = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
    res.json(result);
  } catch (err) {
    console.error('Monthly analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
});

// Category breakdown for a specific month
router.get('/categories', async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.userId;

    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { amount: true, category: true },
    });

    const categories = {};
    let total = 0;
    expenses.forEach(({ amount, category }) => {
      if (!categories[category]) categories[category] = 0;
      categories[category] += amount;
      total += amount;
    });

    const result = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.amount - a.amount);

    res.json({ categories: result, total, month: targetMonth + 1, year: targetYear });
  } catch (err) {
    console.error('Category analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Summary stats
router.get('/summary', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth, total, count] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId, date: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.expense.count({ where: { userId } }),
    ]);

    const thisMonthTotal = thisMonth._sum.amount || 0;
    const lastMonthTotal = lastMonth._sum.amount || 0;
    const change = lastMonthTotal > 0
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
      : null;

    res.json({
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      change: change ? parseFloat(change) : null,
      totalAllTime: total._sum.amount || 0,
      totalExpenses: count,
    });
  } catch (err) {
    console.error('Summary analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;

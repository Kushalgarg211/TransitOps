const express = require('express');
const { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { validateExpense } = require('../validators/expenseValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['Fleet Manager', 'Financial Analyst']), getAllExpenses);
router.get('/:id', authorize(['Fleet Manager', 'Financial Analyst']), getExpenseById);

router.post('/', authorize(['Fleet Manager', 'Financial Analyst']), validateExpense, createExpense);
router.put('/:id', authorize(['Fleet Manager', 'Financial Analyst']), validateExpense, updateExpense);
router.delete('/:id', authorize(['Fleet Manager']), deleteExpense);

module.exports = router;

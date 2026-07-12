const { body } = require('express-validator');
const validate = require('./validate');

const validateExpense = [
  body('vehicle_id')
    .isInt()
    .withMessage('Vehicle ID must be an integer.'),
  body('expense_type')
    .trim()
    .notEmpty()
    .withMessage('Expense type is required.'),
  body('amount')
    .isFloat({ min: 0.1 })
    .withMessage('Amount must be a positive number.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid expense date (YYYY-MM-DD).'),
  validate,
];

module.exports = {
  validateExpense,
};

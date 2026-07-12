const { body } = require('express-validator');
const validate = require('./validate');

const validateFuel = [
  body('vehicle_id')
    .isInt()
    .withMessage('Vehicle ID must be an integer.'),
  body('liters')
    .isFloat({ min: 0.1 })
    .withMessage('Liters must be a positive number.'),
  body('cost')
    .isFloat({ min: 0.1 })
    .withMessage('Cost must be a positive number.'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid purchase date (YYYY-MM-DD).'),
  validate,
];

module.exports = {
  validateFuel,
};

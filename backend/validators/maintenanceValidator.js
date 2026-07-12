const { body } = require('express-validator');
const validate = require('./validate');

const validateMaintenance = [
  body('vehicle_id')
    .isInt()
    .withMessage('Vehicle ID must be an integer.'),
  body('maintenance_type')
    .trim()
    .notEmpty()
    .withMessage('Maintenance type is required.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number.'),
  body('start_date')
    .isISO8601()
    .withMessage('Please provide a valid start date (YYYY-MM-DD).'),
  body('end_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Please provide a valid end date (YYYY-MM-DD).'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean.'),
  validate,
];

module.exports = {
  validateMaintenance,
};

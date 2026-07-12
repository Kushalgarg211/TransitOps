const { body } = require('express-validator');
const validate = require('./validate');

const validateDriver = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required.'),
  body('license_number')
    .trim()
    .notEmpty()
    .withMessage('License number is required.'),
  body('license_category')
    .trim()
    .notEmpty()
    .withMessage('License category is required.'),
  body('license_expiry_date')
    .isISO8601()
    .withMessage('Please provide a valid license expiry date (YYYY-MM-DD).'),
  body('contact_number')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required.'),
  body('safety_score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Safety score must be between 0.00 and 100.00.'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'Suspended'])
    .withMessage('Invalid status. Status must be one of: Available, On Trip, Suspended.'),
  validate,
];

module.exports = {
  validateDriver,
};

const { body } = require('express-validator');
const validate = require('./validate');

const validateVehicle = [
  body('registration_number')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required.'),
  body('vehicle_name')
    .trim()
    .notEmpty()
    .withMessage('Vehicle name is required.'),
  body('vehicle_model')
    .trim()
    .notEmpty()
    .withMessage('Vehicle model is required.'),
  body('vehicle_type')
    .trim()
    .notEmpty()
    .withMessage('Vehicle type is required.'),
  body('max_load_capacity')
    .isFloat({ min: 0.1 })
    .withMessage('Max load capacity must be a positive number.'),
  body('odometer')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Odometer must be a non-negative number.'),
  body('acquisition_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Acquisition cost must be a non-negative number.'),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired'])
    .withMessage('Invalid status. Status must be one of: Available, On Trip, In Shop, Retired.'),
  validate,
];

module.exports = {
  validateVehicle,
};

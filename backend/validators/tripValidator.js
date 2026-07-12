const { body } = require('express-validator');
const validate = require('./validate');

const validateTrip = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source address is required.'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination address is required.'),
  body('vehicle_id')
    .isInt()
    .withMessage('Vehicle ID must be an integer.'),
  body('driver_id')
    .isInt()
    .withMessage('Driver ID must be an integer.'),
  body('cargo_weight')
    .isFloat({ min: 0.1 })
    .withMessage('Cargo weight must be a positive number.'),
  body('planned_distance')
    .isFloat({ min: 0.1 })
    .withMessage('Planned distance must be a positive number.'),
  body('revenue')
    .isFloat({ min: 0 })
    .withMessage('Revenue must be a non-negative number.'),
  validate,
];

const validateCompleteTrip = [
  body('actual_distance')
    .isFloat({ min: 0.1 })
    .withMessage('Actual distance must be a positive number.'),
  body('fuel_used')
    .isFloat({ min: 0.1 })
    .withMessage('Fuel used must be a positive number.'),
  body('end_odometer')
    .isFloat({ min: 0.1 })
    .withMessage('End odometer must be a positive number.'),
  validate,
];

module.exports = {
  validateTrip,
  validateCompleteTrip,
};

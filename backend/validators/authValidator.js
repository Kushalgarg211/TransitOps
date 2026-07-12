const { body } = require('express-validator');
const validate = require('./validate');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('role')
    .isIn(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'])
    .withMessage('Invalid role. Role must be one of: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst.'),
  validate,
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
};

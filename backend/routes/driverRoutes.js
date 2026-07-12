const express = require('express');
const { getAllDrivers, getEligibleDrivers, getDriverById, createDriver, updateDriver, deleteDriver, sendLicenseExpiryReminders } = require('../controllers/driverController');
const { validateDriver } = require('../validators/driverValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllDrivers);
router.get('/eligible', authorize(['Fleet Manager', 'Dispatcher', 'Safety Officer']), getEligibleDrivers);
router.get('/:id', getDriverById);

router.post('/', authorize(['Fleet Manager', 'Dispatcher', 'Safety Officer']), validateDriver, createDriver);
router.put('/:id', authorize(['Fleet Manager', 'Dispatcher', 'Safety Officer']), validateDriver, updateDriver);
router.delete('/:id', authorize(['Fleet Manager']), deleteDriver);

router.post('/reminders/license-expiry', authorize(['Fleet Manager', 'Safety Officer']), sendLicenseExpiryReminders);

module.exports = router;

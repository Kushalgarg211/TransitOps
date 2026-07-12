const express = require('express');
const { getAllFuelLogs, getFuelLogById, createFuelLog, updateFuelLog, deleteFuelLog } = require('../controllers/fuelController');
const { validateFuel } = require('../validators/fuelValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['Fleet Manager', 'Financial Analyst']), getAllFuelLogs);
router.get('/:id', authorize(['Fleet Manager', 'Financial Analyst']), getFuelLogById);

router.post('/', authorize(['Fleet Manager', 'Financial Analyst']), validateFuel, createFuelLog);
router.put('/:id', authorize(['Fleet Manager', 'Financial Analyst']), validateFuel, updateFuelLog);
router.delete('/:id', authorize(['Fleet Manager']), deleteFuelLog);

module.exports = router;

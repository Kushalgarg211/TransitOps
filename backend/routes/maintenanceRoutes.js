const express = require('express');
const { getAllMaintenanceLogs, getMaintenanceLogById, createMaintenanceLog, updateMaintenanceLog, closeMaintenanceLog, deleteMaintenanceLog } = require('../controllers/maintenanceController');
const { validateMaintenance } = require('../validators/maintenanceValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllMaintenanceLogs);
router.get('/:id', getMaintenanceLogById);

router.post('/', authorize(['Fleet Manager', 'Safety Officer']), validateMaintenance, createMaintenanceLog);
router.post('/:id/close', authorize(['Fleet Manager', 'Safety Officer']), closeMaintenanceLog);
router.put('/:id', authorize(['Fleet Manager', 'Safety Officer']), validateMaintenance, updateMaintenanceLog);
router.delete('/:id', authorize(['Fleet Manager']), deleteMaintenanceLog);

module.exports = router;

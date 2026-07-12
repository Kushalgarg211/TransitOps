const express = require('express');
const { getAllVehicles, getDispatchableVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { validateVehicle } = require('../validators/vehicleValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/dispatchable', authorize(['Fleet Manager', 'Dispatcher']), getDispatchableVehicles);
router.get('/:id', getVehicleById);

router.post('/', authorize(['Fleet Manager', 'Dispatcher']), validateVehicle, createVehicle);
router.put('/:id', authorize(['Fleet Manager', 'Dispatcher']), validateVehicle, updateVehicle);
router.delete('/:id', authorize(['Fleet Manager']), deleteVehicle);

module.exports = router;

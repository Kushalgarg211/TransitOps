const express = require('express');
const { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip } = require('../controllers/tripController');
const { validateTrip, validateCompleteTrip } = require('../validators/tripValidator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTrips);
router.get('/:id', getTripById);

router.post('/', authorize(['Fleet Manager', 'Dispatcher']), validateTrip, createTrip);
router.put('/:id', authorize(['Fleet Manager', 'Dispatcher']), validateTrip, updateTrip);
router.delete('/:id', authorize(['Fleet Manager']), deleteTrip);

router.post('/:id/dispatch', authorize(['Fleet Manager', 'Dispatcher']), dispatchTrip);
router.post('/:id/complete', authorize(['Fleet Manager', 'Dispatcher']), validateCompleteTrip, completeTrip);
router.post('/:id/cancel', authorize(['Fleet Manager', 'Dispatcher']), cancelTrip);

module.exports = router;

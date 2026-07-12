const { Trip, Vehicle, Driver, sequelize } = require('../models');

const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registration_number', 'vehicle_name', 'status'] },
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'license_number', 'status'] },
      ],
    });
    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
      ],
    });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }
    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue } = req.body;

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Assigned Vehicle not found.' });
    }

    const driver = await Driver.findByPk(driver_id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Assigned Driver not found.' });
    }

    // Cargo capacity check
    if (parseFloat(cargo_weight) > parseFloat(vehicle.max_load_capacity)) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargo_weight} kg) exceeds vehicle max load capacity (${vehicle.max_load_capacity} kg).`,
      });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicle_id,
      driver_id,
      cargo_weight,
      planned_distance,
      revenue,
      start_odometer: vehicle.odometer, // snap the odometer at creation
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully in Pending status.',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending trips can be updated.',
      });
    }

    const { vehicle_id, driver_id, cargo_weight } = req.body;

    let vehicle = null;
    if (vehicle_id) {
      vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }
    } else {
      vehicle = await Vehicle.findByPk(trip.vehicle_id);
    }

    if (driver_id) {
      const driver = await Driver.findByPk(driver_id);
      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found.' });
      }
    }

    const weightToCheck = cargo_weight || trip.cargo_weight;
    if (weightToCheck && vehicle && parseFloat(weightToCheck) > parseFloat(vehicle.max_load_capacity)) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${weightToCheck} kg) exceeds vehicle max load capacity (${vehicle.max_load_capacity} kg).`,
      });
    }

    await trip.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully.',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status === 'On Trip') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active trip. Cancel it first.',
      });
    }

    await trip.destroy();
    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const dispatchTrip = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status !== 'Pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Only Pending trips can be dispatched. Current status: ${trip.status}`,
      });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicle_id, { transaction });
    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Assigned Vehicle not found.' });
    }

    const driver = await Driver.findByPk(trip.driver_id, { transaction });
    if (!driver) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Assigned Driver not found.' });
    }

    // Enforce Business Rules
    // 1. Retired / In Shop / On Trip checks
    if (vehicle.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Vehicle cannot be dispatched. Current status: '${vehicle.status}'. Must be 'Available'.`,
      });
    }

    // 2. Driver status check (Suspended, On Trip, etc.)
    if (driver.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Driver cannot be assigned. Current status: '${driver.status}'. Must be 'Available'.`,
      });
    }

    // 3. Driver license expiry check
    const todayStr = new Date().toISOString().split('T')[0];
    if (driver.license_expiry_date < todayStr) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Driver cannot be assigned. License expired on ${driver.license_expiry_date}.`,
      });
    }

    // 4. Cargo weight check
    if (parseFloat(trip.cargo_weight) > parseFloat(vehicle.max_load_capacity)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${trip.cargo_weight} kg) exceeds vehicle max load (${vehicle.max_load_capacity} kg).`,
      });
    }

    // Update statuses inside transaction
    await trip.update({
      status: 'On Trip',
      dispatch_time: new Date(),
      start_odometer: vehicle.odometer,
    }, { transaction });

    await vehicle.update({ status: 'On Trip' }, { transaction });
    await driver.update({ status: 'On Trip' }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Trip dispatched successfully. Vehicle and Driver statuses updated to On Trip.',
      data: trip,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const completeTrip = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { actual_distance, fuel_used, end_odometer } = req.body;

    const trip = await Trip.findByPk(req.params.id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status !== 'On Trip') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Only active (On Trip) trips can be completed. Current status: ${trip.status}`,
      });
    }

    // Validate odometer progression
    if (parseFloat(end_odometer) < parseFloat(trip.start_odometer)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `End odometer (${end_odometer}) must be greater than or equal to start odometer (${trip.start_odometer}).`,
      });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicle_id, { transaction });
    const driver = await Driver.findByPk(trip.driver_id, { transaction });

    // Update Trip
    await trip.update({
      status: 'Completed',
      completion_time: new Date(),
      actual_distance,
      fuel_used,
      end_odometer,
    }, { transaction });

    // Release Vehicle to Available unless its base record status was modified (e.g. retired)
    const newVehicleStatus = vehicle.status === 'Retired' ? 'Retired' : 'Available';
    await vehicle.update({
      status: newVehicleStatus,
      odometer: end_odometer, // vehicle odometer increases
    }, { transaction });

    // Release Driver
    const newDriverStatus = driver.status === 'Suspended' ? 'Suspended' : 'Available';
    await driver.update({ status: newDriverStatus }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Trip completed successfully. Vehicle and Driver are now Available.',
      data: trip,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const cancelTrip = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a trip that is already ${trip.status}.`,
      });
    }

    const originalStatus = trip.status;

    await trip.update({ status: 'Cancelled' }, { transaction });

    // Restore vehicle & driver back to Available only if trip was actively underway
    if (originalStatus === 'On Trip') {
      const vehicle = await Vehicle.findByPk(trip.vehicle_id, { transaction });
      const driver = await Driver.findByPk(trip.driver_id, { transaction });

      if (vehicle && vehicle.status === 'On Trip') {
        await vehicle.update({ status: 'Available' }, { transaction });
      }
      if (driver && driver.status === 'On Trip') {
        await driver.update({ status: 'Available' }, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully. Vehicle and Driver statuses restored to Available.',
      data: trip,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};

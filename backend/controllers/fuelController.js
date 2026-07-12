const { FuelLog, Vehicle } = require('../models');

const getAllFuelLogs = async (req, res, next) => {
  try {
    const logs = await FuelLog.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registration_number', 'vehicle_name'] }],
    });
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

const getFuelLogById = async (req, res, next) => {
  try {
    const log = await FuelLog.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'vehicle' }],
    });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel record not found.' });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const createFuelLog = async (req, res, next) => {
  try {
    const { vehicle_id, liters, cost, date } = req.body;

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const log = await FuelLog.create({
      vehicle_id,
      liters,
      cost,
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Fuel log recorded successfully.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

const updateFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel record not found.' });
    }

    const { vehicle_id } = req.body;
    if (vehicle_id) {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }
    }

    await log.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Fuel record updated.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel record not found.' });
    }

    await log.destroy();
    return res.status(200).json({
      success: true,
      message: 'Fuel log deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
};

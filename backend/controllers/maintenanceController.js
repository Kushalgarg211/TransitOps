const { MaintenanceLog, Vehicle, sequelize } = require('../models');

const getAllMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.findAll({
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

const getMaintenanceLogById = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'vehicle' }],
    });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { vehicle_id, maintenance_type, description, cost, start_date } = req.body;

    const vehicle = await Vehicle.findByPk(vehicle_id, { transaction });
    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Vehicle cannot enter shop if it's currently on a trip
    if (vehicle.status === 'On Trip') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vehicle is currently On Trip. Complete or cancel the trip first.',
      });
    }

    const log = await MaintenanceLog.create({
      vehicle_id,
      maintenance_type,
      description,
      cost,
      start_date,
      active: true,
    }, { transaction });

    // Set Vehicle status to In Shop
    await vehicle.update({ status: 'In Shop' }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Maintenance session opened. Vehicle set to "In Shop".',
      data: log,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const updateMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    await log.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Maintenance record updated.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

const closeMaintenanceLog = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { cost, end_date } = req.body;

    const log = await MaintenanceLog.findByPk(req.params.id, { transaction });
    if (!log) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    if (!log.active) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This maintenance session is already closed.',
      });
    }

    const finalEndDate = end_date || new Date().toISOString().split('T')[0];

    await log.update({
      active: false,
      cost: cost || log.cost,
      end_date: finalEndDate,
    }, { transaction });

    const vehicle = await Vehicle.findByPk(log.vehicle_id, { transaction });
    if (vehicle) {
      // Set Vehicle status back to Available, unless marked as Retired
      const newStatus = vehicle.status === 'Retired' ? 'Retired' : 'Available';
      await vehicle.update({ status: newStatus }, { transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Maintenance session closed. Vehicle status restored.',
      data: log,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const deleteMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    await log.destroy();
    return res.status(200).json({
      success: true,
      message: 'Maintenance log deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  closeMaintenanceLog,
  deleteMaintenanceLog,
};

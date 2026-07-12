const { Vehicle } = require('../models');

const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll();
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

const getDispatchableVehicles = async (req, res, next) => {
  try {
    // Only 'Available' vehicles can be dispatched.
    // Retired or In Shop or On Trip vehicles are excluded.
    const vehicles = await Vehicle.findAll({ where: { status: 'Available' } });
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }
    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const { registration_number, vehicle_name, vehicle_model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status } = req.body;

    const existingVehicle = await Vehicle.findOne({ where: { registration_number } });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Registration number must be unique.',
      });
    }

    const vehicle = await Vehicle.create({
      registration_number,
      vehicle_name,
      vehicle_model,
      vehicle_type,
      max_load_capacity,
      odometer,
      acquisition_cost,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully.',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { registration_number } = req.body;
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    if (registration_number && registration_number !== vehicle.registration_number) {
      const existing = await Vehicle.findOne({ where: { registration_number } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Registration number must be unique.',
        });
      }
    }

    await vehicle.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    await vehicle.destroy();
    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getDispatchableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};

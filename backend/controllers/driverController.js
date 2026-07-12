const { Driver } = require('../models');
const { emailExpiredDrivers } = require('../services/driverService');
const { Op } = require('sequelize');

const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.findAll();
    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

const getEligibleDrivers = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Eligible drivers: Available, not suspended (implied by Available), and license not expired
    const drivers = await Driver.findAll({
      where: {
        status: 'Available',
        license_expiry_date: {
          [Op.gte]: todayStr,
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }
    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const createDriver = async (req, res, next) => {
  try {
    const { name, license_number, license_category, license_expiry_date, contact_number, safety_score, status } = req.body;

    const existing = await Driver.findOne({ where: { license_number } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'License number must be unique.',
      });
    }

    const driver = await Driver.create({
      name,
      license_number,
      license_category,
      license_expiry_date,
      contact_number,
      safety_score,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Driver created successfully.',
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    const { license_number } = req.body;
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    if (license_number && license_number !== driver.license_number) {
      const existing = await Driver.findOne({ where: { license_number } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'License number must be unique.',
        });
      }
    }

    await driver.update(req.body);
    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully.',
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    await driver.destroy();
    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const sendLicenseExpiryReminders = async (req, res, next) => {
  try {
    const emailResults = await emailExpiredDrivers();
    return res.status(200).json({
      success: true,
      message: 'License expiry emails processed.',
      results: emailResults,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDrivers,
  getEligibleDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  sendLicenseExpiryReminders,
};

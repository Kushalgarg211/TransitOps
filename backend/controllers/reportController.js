const { getDashboardKPIs, getFleetAnalytics } = require('../services/reportService');
const { exportTripsToCsv } = require('../utils/csvExporter');
const { generateOperationalPDF } = require('../utils/pdfGenerator');
const { Trip, Vehicle, Driver } = require('../models');

const getKPIs = async (req, res, next) => {
  try {
    const kpis = await getDashboardKPIs();
    return res.status(200).json({
      success: true,
      data: kpis,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await getFleetAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['registration_number'] },
        { model: Driver, as: 'driver', attributes: ['name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const csvContent = exportTripsToCsv(trips);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_trips_report.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const kpis = await getDashboardKPIs();
    const analytics = await getFleetAnalytics();
    const completedTrips = await Trip.findAll({
      where: { status: 'Completed' },
      order: [['completion_time', 'DESC']],
      limit: 10,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_operational_report.pdf');

    generateOperationalPDF(res, kpis, analytics, completedTrips);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKPIs,
  getAnalytics,
  exportCSV,
  exportPDF,
};

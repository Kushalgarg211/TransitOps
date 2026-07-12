const { Vehicle, Driver, Trip, FuelLog, MaintenanceLog, Expense, sequelize } = require('../models');

const getDashboardKPIs = async () => {
  const vehicleStats = await Vehicle.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true,
  });

  const driverStats = await Driver.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true,
  });

  const tripStats = await Trip.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true,
  });

  const kpis = {
    vehicles: {
      total: 0,
      active: 0,      // status: On Trip
      available: 0,   // status: Available
      inShop: 0,      // status: In Shop
      retired: 0,     // status: Retired
    },
    drivers: {
      total: 0,
      available: 0,   // status: Available
      onTrip: 0,      // status: On Trip
      suspended: 0,   // status: Suspended
    },
    trips: {
      total: 0,
      pending: 0,
      onTrip: 0,
      completed: 0,
      cancelled: 0,
    },
    fleetUtilization: 0,
  };

  vehicleStats.forEach(v => {
    const status = v.status;
    const count = parseInt(v.count, 10) || 0;
    kpis.vehicles.total += count;
    if (status === 'On Trip') kpis.vehicles.active = count;
    else if (status === 'Available') kpis.vehicles.available = count;
    else if (status === 'In Shop') kpis.vehicles.inShop = count;
    else if (status === 'Retired') kpis.vehicles.retired = count;
  });

  driverStats.forEach(d => {
    const status = d.status;
    const count = parseInt(d.count, 10) || 0;
    kpis.drivers.total += count;
    if (status === 'Available') kpis.drivers.available = count;
    else if (status === 'On Trip') kpis.drivers.onTrip = count;
    else if (status === 'Suspended') kpis.drivers.suspended = count;
  });

  tripStats.forEach(t => {
    const status = t.status;
    const count = parseInt(t.count, 10) || 0;
    kpis.trips.total += count;
    if (status === 'Pending') kpis.trips.pending = count;
    else if (status === 'On Trip') kpis.trips.onTrip = count;
    else if (status === 'Completed') kpis.trips.completed = count;
    else if (status === 'Cancelled') kpis.trips.cancelled = count;
  });

  // Fleet Utilization = (Vehicles On Trip / (Total Vehicles - Retired Vehicles)) * 100
  const activeFleetCount = kpis.vehicles.total - kpis.vehicles.retired;
  if (activeFleetCount > 0) {
    kpis.fleetUtilization = parseFloat(((kpis.vehicles.active / activeFleetCount) * 100).toFixed(2));
  } else {
    kpis.fleetUtilization = 0;
  }

  return kpis;
};

const getFleetAnalytics = async () => {
  // 1. Overall Fuel Efficiency (Distance / Fuel used for Completed trips)
  const tripTotals = await Trip.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('actual_distance')), 'totalDistance'],
      [sequelize.fn('SUM', sequelize.col('fuel_used')), 'totalFuelUsed'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
    ],
    where: { status: 'Completed' },
    raw: true,
  });

  const totalDistance = parseFloat(tripTotals?.totalDistance) || 0;
  const totalFuelUsed = parseFloat(tripTotals?.totalFuelUsed) || 0;
  const totalRevenue = parseFloat(tripTotals?.totalRevenue) || 0;

  const fleetFuelEfficiency = totalFuelUsed > 0 ? parseFloat((totalDistance / totalFuelUsed).toFixed(2)) : 0;

  // 2. Financial Aggregates for ROI
  const fuelTotals = await FuelLog.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('cost')), 'totalFuelCost']],
    raw: true,
  });
  const totalFuelCost = parseFloat(fuelTotals?.totalFuelCost) || 0;

  const maintenanceTotals = await MaintenanceLog.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('cost')), 'totalMaintenanceCost']],
    raw: true,
  });
  const totalMaintenanceCost = parseFloat(maintenanceTotals?.totalMaintenanceCost) || 0;

  const expenseTotals = await Expense.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalExpenseCost']],
    raw: true,
  });
  const totalExpenseCost = parseFloat(expenseTotals?.totalExpenseCost) || 0;

  const vehicleTotals = await Vehicle.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('acquisition_cost')), 'totalAcquisitionCost']],
    raw: true,
  });
  const totalAcquisitionCost = parseFloat(vehicleTotals?.totalAcquisitionCost) || 0;

  // ROI overall: (Revenue - (Fuel + Maintenance)) / Acquisition Cost
  const roiDividend = totalRevenue - (totalFuelCost + totalMaintenanceCost);
  const fleetROI = totalAcquisitionCost > 0 ? parseFloat((roiDividend / totalAcquisitionCost).toFixed(4)) : 0;

  // 3. Per-Vehicle Breakdowns
  const vehicles = await Vehicle.findAll({
    include: [
      { model: Trip, as: 'trips', where: { status: 'Completed' }, required: false },
      { model: FuelLog, as: 'fuelLogs', required: false },
      { model: MaintenanceLog, as: 'maintenanceLogs', required: false },
      { model: Expense, as: 'expenses', required: false }
    ]
  });

  const vehicleBreakdown = vehicles.map(v => {
    let vRevenue = 0;
    let vDistance = 0;
    let vFuelUsed = 0;
    v.trips.forEach(t => {
      vRevenue += parseFloat(t.revenue) || 0;
      vDistance += parseFloat(t.actual_distance) || 0;
      vFuelUsed += parseFloat(t.fuel_used) || 0;
    });

    let vFuelCost = 0;
    v.fuelLogs.forEach(f => {
      vFuelCost += parseFloat(f.cost) || 0;
    });

    let vMaintenanceCost = 0;
    v.maintenanceLogs.forEach(m => {
      vMaintenanceCost += parseFloat(m.cost) || 0;
    });

    let vExpenseCost = 0;
    v.expenses.forEach(e => {
      vExpenseCost += parseFloat(e.amount) || 0;
    });

    const vAcqCost = parseFloat(v.acquisition_cost) || 0;
    const vFuelEfficiency = vFuelUsed > 0 ? parseFloat((vDistance / vFuelUsed).toFixed(2)) : 0;
    const vRoiDividend = vRevenue - (vFuelCost + vMaintenanceCost);
    const vROI = vAcqCost > 0 ? parseFloat((vRoiDividend / vAcqCost).toFixed(4)) : 0;

    return {
      vehicleId: v.id,
      registrationNumber: v.registration_number,
      name: v.vehicle_name,
      status: v.status,
      acquisitionCost: vAcqCost,
      metrics: {
        totalRevenue: vRevenue,
        totalDistance: vDistance,
        totalFuelUsed: vFuelUsed,
        totalFuelCost: vFuelCost,
        totalMaintenanceCost: vMaintenanceCost,
        totalExpenseCost: vExpenseCost,
        fuelEfficiency: vFuelEfficiency,
        roi: vROI
      }
    };
  });

  return {
    fleetSummary: {
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenseCost,
      totalAcquisitionCost,
      fuelEfficiency: fleetFuelEfficiency,
      roi: fleetROI,
      roiPercentage: parseFloat((fleetROI * 100).toFixed(2))
    },
    vehicleBreakdown
  };
};

module.exports = {
  getDashboardKPIs,
  getFleetAnalytics,
};

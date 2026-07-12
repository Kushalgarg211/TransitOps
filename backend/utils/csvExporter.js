const { createObjectCsvStringifier } = require('csv-writer');

const exportTripsToCsv = (trips) => {
  const headers = [
    { id: 'id', title: 'Trip ID' },
    { id: 'source', title: 'Source' },
    { id: 'destination', title: 'Destination' },
    { id: 'vehicleReg', title: 'Vehicle Reg' },
    { id: 'driverName', title: 'Driver Name' },
    { id: 'cargoWeight', title: 'Cargo Weight (kg)' },
    { id: 'plannedDistance', title: 'Planned Dist (km)' },
    { id: 'actualDistance', title: 'Actual Dist (km)' },
    { id: 'revenue', title: 'Revenue ($)' },
    { id: 'fuelUsed', title: 'Fuel Used (L)' },
    { id: 'status', title: 'Status' },
    { id: 'dispatchTime', title: 'Dispatch Time' },
    { id: 'completionTime', title: 'Completion Time' },
  ];

  const csvStringifier = createObjectCsvStringifier({ header: headers });

  const records = trips.map(t => ({
    id: t.id,
    source: t.source,
    destination: t.destination,
    vehicleReg: t.vehicle?.registration_number || 'N/A',
    driverName: t.driver?.name || 'N/A',
    cargoWeight: t.cargo_weight,
    plannedDistance: t.planned_distance,
    actualDistance: t.actual_distance || '',
    revenue: t.revenue,
    fuelUsed: t.fuel_used || '',
    status: t.status,
    dispatchTime: t.dispatch_time ? new Date(t.dispatch_time).toLocaleString() : '',
    completionTime: t.completion_time ? new Date(t.completion_time).toLocaleString() : '',
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};

module.exports = {
  exportTripsToCsv,
};

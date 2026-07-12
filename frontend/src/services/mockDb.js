// Updated Mock Database matching the wireframe sketches
const INITIAL_VEHICLES = [
  { id: 'v-1', plateNumber: 'GJ01AB4521', make: 'VAN-05', model: 'Van', type: 'Van', capacity: '500 kg', capacityVal: 500, mileage: 74000, acqCost: 620000, status: 'Available' },
  { id: 'v-2', plateNumber: 'GJ01AB9981', make: 'TRUCK-11', model: 'Truck', type: 'Truck', capacity: '5 Ton', capacityVal: 5000, mileage: 182000, acqCost: 2450000, status: 'On Trip' },
  { id: 'v-3', plateNumber: 'GJ01AB1120', make: 'MINI-03', model: 'Mini', type: 'Mini', capacity: '1 Ton', capacityVal: 1000, mileage: 66000, acqCost: 410000, status: 'In Shop' },
  { id: 'v-4', plateNumber: 'GJ01AB0008', make: 'VAN-09', model: 'Van', type: 'Van', capacity: '750 kg', capacityVal: 750, mileage: 241900, acqCost: 590000, status: 'Retired' },
  { id: 'v-5', plateNumber: 'GJ01AB0044', make: 'TRUCK-04', model: 'Truck', type: 'Truck', capacity: '4 Ton', capacityVal: 400, mileage: 105000, acqCost: 2200000, status: 'Available' },
];

const INITIAL_DRIVERS = [
  { id: 'd-1', name: 'Alex', licenseNumber: 'DL-88213', licenseClass: 'LMV', expiryDate: '2028-12-31', contact: '98765xxxxx', tripCompl: '96%', safetyScore: 95, status: 'Available', safetyStatus: 'Available' },
  { id: 'd-2', name: 'John', licenseNumber: 'DL-44120', licenseClass: 'HMV', expiryDate: '2025-03-31', contact: '98220xxxxx', tripCompl: '81%', safetyScore: 68, status: 'Suspended', safetyStatus: 'Suspended' },
  { id: 'd-3', name: 'Priya', licenseNumber: 'DL-77031', licenseClass: 'LMV', expiryDate: '2027-08-31', contact: '99110xxxxx', tripCompl: '99%', safetyScore: 99, status: 'On Trip', safetyStatus: 'On Trip' },
  { id: 'd-4', name: 'Suresh', licenseNumber: 'DL-90045', licenseClass: 'HMV', expiryDate: '2027-01-31', contact: '97440xxxxx', tripCompl: '88%', safetyScore: 88, status: 'Off Duty', safetyStatus: 'Available' },
];

const INITIAL_TRIPS = [
  { id: 't-1', tripNumber: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'v-1', driverId: 'd-1', cargoWeight: 350, distance: 38, revenue: 6200, status: 'Dispatched', eta: '45 min' },
  { id: 't-2', tripNumber: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: 'v-5', driverId: 'd-4', cargoWeight: 380, distance: 45, revenue: 8400, status: 'Draft', eta: 'Awaiting driver' },
  { id: 't-3', tripNumber: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicleId: 'v-3', driverId: 'd-2', cargoWeight: 900, distance: 22, revenue: 3200, status: 'Cancelled', eta: 'Vehicle went to shop' },
];

const INITIAL_MAINTENANCE = [
  { id: 'm-1', vehicleId: 'v-3', description: 'Engine overhauling and brake lining replacements', cost: 4100, type: 'Repair', status: 'Open', date: '2026-07-10' },
  { id: 'm-2', vehicleId: 'v-1', description: 'Standard fluid service', cost: 150, type: 'Routine', status: 'Closed', date: '2026-06-15' },
];

const INITIAL_FUEL = [
  { id: 'f-1', vehicleId: 'v-1', gallons: 25, cost: 2200, odometer: 74000, date: '2026-07-08' },
];

const INITIAL_EXPENSES = [
  { id: 'e-1', vehicleId: 'v-3', type: 'Maintenance', amount: 4100, date: '2026-07-10', description: 'Engine diagnostics' },
  { id: 'e-2', vehicleId: 'v-1', type: 'Fuel', amount: 2200, date: '2026-07-08', description: 'Fuel Fill-up' },
];

const initializeKey = (key, initialValue) => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(initialValue));
  }
};

export const initMockDb = () => {
  // Clear on load to make sure changes take effect immediately in the dashboard
  localStorage.setItem('to_vehicles', JSON.stringify(INITIAL_VEHICLES));
  localStorage.setItem('to_drivers', JSON.stringify(INITIAL_DRIVERS));
  localStorage.setItem('to_trips', JSON.stringify(INITIAL_TRIPS));
  localStorage.setItem('to_maintenance', JSON.stringify(INITIAL_MAINTENANCE));
  localStorage.setItem('to_fuel', JSON.stringify(INITIAL_FUEL));
  localStorage.setItem('to_expenses', JSON.stringify(INITIAL_EXPENSES));
};

// Help helper getter/setters
export const getFromDb = (key) => {
  if (!localStorage.getItem(key)) {
    initMockDb();
  }
  return JSON.parse(localStorage.getItem(key));
};

export const saveToDb = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

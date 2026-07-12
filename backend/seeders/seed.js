const { ensureDatabaseExists } = require('../config/database');
const { sequelize, User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } = require('../models');

async function seed() {
  try {
    // 1. Ensure DB exists
    await ensureDatabaseExists();

    // 2. Sync database (force sync for seeding)
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // 3. Seed Users
    // Users will be hashed by beforeSave hook in the model.
    await User.bulkCreate([
      {
        name: 'Manager User',
        email: 'manager@transitops.com',
        password_hash: 'password123',
        role: 'Fleet Manager',
      },
      {
        name: 'Manager User In',
        email: 'manager@transitops.in',
        password_hash: 'password123',
        role: 'Fleet Manager',
      },
      {
        name: 'Dispatcher User',
        email: 'dispatcher@transitops.com',
        password_hash: 'password123',
        role: 'Dispatcher',
      },
      {
        name: 'Dispatcher User In',
        email: 'Raven.k@transitops.in',
        password_hash: 'password123',
        role: 'Dispatcher',
      },
      {
        name: 'Safety User',
        email: 'safety@transitops.com',
        password_hash: 'password123',
        role: 'Safety Officer',
      },
      {
        name: 'Safety User In',
        email: 'safety@transitops.in',
        password_hash: 'password123',
        role: 'Safety Officer',
      },
      {
        name: 'Finance User',
        email: 'finance@transitops.com',
        password_hash: 'password123',
        role: 'Financial Analyst',
      },
      {
        name: 'Finance User In',
        email: 'finance@transitops.in',
        password_hash: 'password123',
        role: 'Financial Analyst',
      },
      {
        name: 'Sarthak Sahu',
        email: 'sarthaksahu333@gmail.com',
        password_hash: 'vilenop1234',
        role: 'Super User',
      },
    ], { validate: true, individualHooks: true });
    console.log('Seeded Users.');

    // 4. Seed Vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        registration_number: 'REG-001',
        vehicle_name: 'Volvo FH16',
        vehicle_model: 'FH16 750',
        vehicle_type: 'Semi Truck',
        max_load_capacity: 25000.00,
        odometer: 50000.00,
        acquisition_cost: 150000.00,
        status: 'Available',
      },
      {
        registration_number: 'REG-002',
        vehicle_name: 'Scania R500',
        vehicle_model: 'R500 V8',
        vehicle_type: 'Semi Truck',
        max_load_capacity: 24000.00,
        odometer: 120000.00,
        acquisition_cost: 130000.00,
        status: 'In Shop',
      },
      {
        registration_number: 'REG-003',
        vehicle_name: 'Ford Transit',
        vehicle_model: 'Transit 350L',
        vehicle_type: 'Cargo Van',
        max_load_capacity: 3500.00,
        odometer: 180000.00,
        acquisition_cost: 40000.00,
        status: 'Available',
      },
      {
        registration_number: 'REG-004',
        vehicle_name: 'Peterbilt 389',
        vehicle_model: '389 Sleeper',
        vehicle_type: 'Heavy Duty Truck',
        max_load_capacity: 28000.00,
        odometer: 320000.00,
        acquisition_cost: 180000.00,
        status: 'Retired',
      },
    ]);
    console.log('Seeded Vehicles.');

    // 5. Seed Drivers
    // Expiry dates relative to current local time (July 12, 2026)
    const drivers = await Driver.bulkCreate([
      {
        name: 'John Doe',
        license_number: 'LIC-001',
        license_category: 'Class A CDL',
        license_expiry_date: '2027-12-31', // Active
        contact_number: '+155510101',
        safety_score: 95.50,
        status: 'Available',
      },
      {
        name: 'Jane Smith',
        license_number: 'LIC-002',
        license_category: 'Class B CDL',
        license_expiry_date: '2026-05-15', // Expired
        contact_number: '+155510102',
        safety_score: 98.00,
        status: 'Available',
      },
      {
        name: 'Suspended Driver',
        license_number: 'LIC-003',
        license_category: 'Class A CDL',
        license_expiry_date: '2028-06-20', // Active
        contact_number: '+155510103',
        safety_score: 45.00,
        status: 'Suspended',
      },
      {
        name: 'Expiring Driver',
        license_number: 'LIC-004',
        license_category: 'Class A CDL',
        license_expiry_date: '2026-07-28', // Expires within 30 days (July 2026)
        contact_number: '+155510104',
        safety_score: 88.20,
        status: 'Available',
      },
    ]);
    console.log('Seeded Drivers.');

    // 6. Seed Fuel Logs
    await FuelLog.bulkCreate([
      {
        vehicle_id: vehicles[0].id, // Volvo
        liters: 450.00,
        cost: 675.00,
        date: '2026-07-01',
      },
      {
        vehicle_id: vehicles[0].id,
        liters: 500.00,
        cost: 750.00,
        date: '2026-07-08',
      },
      {
        vehicle_id: vehicles[1].id, // Scania
        liters: 600.00,
        cost: 900.00,
        date: '2026-07-05',
      },
      {
        vehicle_id: vehicles[2].id, // Ford Transit
        liters: 80.00,
        cost: 120.00,
        date: '2026-07-10',
      },
    ]);
    console.log('Seeded Fuel Logs.');

    // 7. Seed Maintenance Logs
    await MaintenanceLog.bulkCreate([
      {
        vehicle_id: vehicles[1].id, // Scania (In Shop)
        maintenance_type: 'Engine Overhaul',
        description: 'Replacing pistons and engine gasket set due to low compression.',
        cost: 3500.00,
        start_date: '2026-07-08',
        active: true,
      },
      {
        vehicle_id: vehicles[0].id, // Volvo (Available)
        maintenance_type: 'Brake Pad Replacement',
        description: 'Replaced front brake pads during routine service.',
        cost: 450.00,
        start_date: '2026-06-15',
        end_date: '2026-06-16',
        active: false,
      },
    ]);
    console.log('Seeded Maintenance Logs.');

    // 8. Seed Expenses
    await Expense.bulkCreate([
      {
        vehicle_id: vehicles[0].id,
        expense_type: 'Toll Fees',
        amount: 120.00,
        description: 'Highway tolls for East Coast trip route.',
        date: '2026-07-05',
      },
      {
        vehicle_id: vehicles[2].id,
        expense_type: 'Permit Fee',
        amount: 80.00,
        description: 'State crossing logistics permit.',
        date: '2026-07-04',
      },
    ]);
    console.log('Seeded Expenses.');

    // 9. Seed Trips
    await Trip.bulkCreate([
      {
        source: 'Warehouse A (New York)',
        destination: 'Distribution Center B (Boston)',
        vehicle_id: vehicles[0].id, // Volvo
        driver_id: drivers[0].id,   // John Doe
        cargo_weight: 12000.00,
        planned_distance: 350.00,
        actual_distance: 355.00,
        revenue: 2500.00,
        fuel_used: 110.00,
        start_odometer: 49500.00,
        end_odometer: 49855.00,
        status: 'Completed',
        dispatch_time: '2026-07-02T08:00:00Z',
        completion_time: '2026-07-02T15:30:00Z',
      },
      {
        source: 'Port A (Miami)',
        destination: 'Logistics Park B (Atlanta)',
        vehicle_id: vehicles[0].id, // Volvo
        driver_id: drivers[0].id,   // John Doe
        cargo_weight: 18000.00,
        planned_distance: 660.00,
        revenue: 4500.00,
        start_odometer: 50000.00,
        status: 'Pending',
      },
    ]);
    console.log('Seeded Trips.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seed();

const { sequelize } = require('../config/database');

const UserModel = require('./user');
const VehicleModel = require('./vehicle');
const DriverModel = require('./driver');
const TripModel = require('./trip');
const MaintenanceModel = require('./maintenance');
const FuelModel = require('./fuel');
const ExpenseModel = require('./expense');

const User = UserModel(sequelize);
const Vehicle = VehicleModel(sequelize);
const Driver = DriverModel(sequelize);
const Trip = TripModel(sequelize);
const MaintenanceLog = MaintenanceModel(sequelize);
const FuelLog = FuelModel(sequelize);
const Expense = ExpenseModel(sequelize);

// Vehicle hasMany Trips, Trip belongsTo Vehicle
Vehicle.hasMany(Trip, { foreignKey: 'vehicle_id', as: 'trips' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Driver hasMany Trips, Trip belongsTo Driver
Driver.hasMany(Trip, { foreignKey: 'driver_id', as: 'trips' });
Trip.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

// Vehicle hasMany MaintenanceLogs, MaintenanceLog belongsTo Vehicle
Vehicle.hasMany(MaintenanceLog, { foreignKey: 'vehicle_id', as: 'maintenanceLogs' });
MaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Vehicle hasMany FuelLogs, FuelLog belongsTo Vehicle
Vehicle.hasMany(FuelLog, { foreignKey: 'vehicle_id', as: 'fuelLogs' });
FuelLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Vehicle hasMany Expenses, Expense belongsTo Vehicle
Vehicle.hasMany(Expense, { foreignKey: 'vehicle_id', as: 'expenses' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
};

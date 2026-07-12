const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cargo_weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    planned_distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    actual_distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    revenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    fuel_used: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    start_odometer: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    end_odometer: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'On Trip', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    dispatch_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completion_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'trips',
  });

  return Trip;
};

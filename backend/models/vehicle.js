const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    registration_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vehicle_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    max_load_capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    odometer: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    acquisition_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('Available', 'On Trip', 'In Shop', 'Retired'),
      allowNull: false,
      defaultValue: 'Available',
    },
  }, {
    tableName: 'vehicles',
  });

  return Vehicle;
};

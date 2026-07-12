const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FuelLog = sequelize.define('FuelLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    liters: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'fuel_logs',
    updatedAt: false, // Only created_at is needed for fuel logs
  });

  return FuelLog;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    license_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    license_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    license_expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    safety_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.00,
    },
    status: {
      type: DataTypes.ENUM('Available', 'On Trip', 'Suspended'),
      allowNull: false,
      defaultValue: 'Available',
    },
  }, {
    tableName: 'drivers',
  });

  return Driver;
};

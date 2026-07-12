const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'transitops_db';

const sequelize = new Sequelize(database, user, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: true,
    underscored: true, // Auto-mapping to snake_case for MySQL tables
  },
});

async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    console.log(`Database "${database}" verified/created successfully.`);
  } catch (error) {
    console.error('Error ensuring database exists:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  ensureDatabaseExists,
};

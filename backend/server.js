const app = require('./app');
const { ensureDatabaseExists, sequelize } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Ensure MySQL database exists
    await ensureDatabaseExists();

    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully.');

    // Sync models (creates tables if they do not exist, does not overwrite data)
    await sequelize.sync();
    console.log('Database models synchronized successfully.');

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`TransitOps Backend is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

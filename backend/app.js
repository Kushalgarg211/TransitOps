const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Dashboard controller mapping
const { getKPIs } = require('./controllers/reportController');
const { authenticate } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Bindings
app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/fuel', fuelRoutes);
app.use('/expenses', expenseRoutes);
app.use('/reports', reportRoutes);

// Shortcuts
app.get('/dashboard', authenticate, getKPIs);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TransitOps API is healthy.' });
});

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Resource not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

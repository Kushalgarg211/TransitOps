const express = require('express');
const { getKPIs, getAnalytics, exportCSV, exportPDF } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/kpis', getKPIs);
router.get('/analytics', authorize(['Fleet Manager', 'Financial Analyst']), getAnalytics);
router.get('/export/csv', authorize(['Fleet Manager', 'Financial Analyst']), exportCSV);
router.get('/export/pdf', authorize(['Fleet Manager', 'Financial Analyst']), exportPDF);

module.exports = router;

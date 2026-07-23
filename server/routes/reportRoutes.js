const express = require('express');
const router = express.Router();
const rc = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, rc.getSummary);
router.get('/export/csv', protect, rc.exportCSV);
router.get('/export/pdf', protect, rc.exportPDF);

module.exports = router;

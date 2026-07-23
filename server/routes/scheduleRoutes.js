const express = require('express');
const router = express.Router();
const sc = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, sc.getSchedules);
router.post('/', protect, sc.createSchedule);
router.patch('/:id/toggle', protect, sc.toggleSchedule);
router.delete('/:id', protect, sc.deleteSchedule);

module.exports = router;

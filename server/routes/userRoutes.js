const express = require('express');
const router = express.Router();
const uc = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, uc.getMe);
router.put('/me', protect, uc.updateMe);
router.put('/me/password', protect, uc.changePassword);
router.get('/', protect, uc.getUsers);
router.patch('/:id/role', protect, uc.updateRole);
router.patch('/:id/toggle', protect, uc.toggleUser);

module.exports = router;

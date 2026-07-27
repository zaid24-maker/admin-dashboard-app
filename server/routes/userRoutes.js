const express = require('express');
const router = express.Router();
const uc = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/avatars');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.get('/me', protect, uc.getMe);
router.put('/me', protect, uc.updateMe);
router.put('/me/password', protect, uc.changePassword);
router.post('/avatar', protect, upload.single('avatar'), uc.uploadAvatar);
router.get('/', protect, uc.getUsers);
router.patch('/:id/role', protect, uc.updateRole);
router.patch('/:id/toggle', protect, uc.toggleUser);
router.put('/:id/target', protect, uc.updateTarget);

module.exports = router;

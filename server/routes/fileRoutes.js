const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', protect, upload.single('document'), fileController.uploadFile);
router.get('/', protect, fileController.getFiles);
router.put('/:id', protect, fileController.updateFile);
router.delete('/:id', protect, fileController.deleteFile);

module.exports = router;
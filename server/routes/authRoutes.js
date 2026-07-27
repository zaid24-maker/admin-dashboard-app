const express = require('express');
const router = express.Router();
const { register, login, me, sendOtp, verifyOtp, generate2FA, enable2FA, login2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/test', (req, res) => {
    res.send("Hello from your Express backend!");
});

router.post('/register', register);
router.post('/login', login);
router.post('/login/2fa', login2FA);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/enable', protect, enable2FA);
router.get('/me', protect, me);

module.exports = router;

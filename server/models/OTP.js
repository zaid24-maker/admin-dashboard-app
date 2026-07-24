const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true, // Email or Phone number
        trim: true
    },
    code: {
        type: String, // 6 digit code
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        expires: 0 // TTL Index - MongoDB auto-deletes the document when expiresAt datetime is reached
    }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);

const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists with that email" });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        // 2. Find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            // We don't say "User not found" for security reasons. We just say "Invalid credentials".
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // 3. Compare the typed password with the hashed database password
        const bcrypt = require('bcrypt'); // We need bcrypt to compare the hashes!
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // FOR DEVELOPMENT: Force auto-elevate account to Master Admin so you can extensively test RBAC!
        user.role = 'Admin';
        await user.save();

        // 4. Passwords match! Generate token and log them in
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

exports.me = async (req, res) => {
    res.json({ success: true, message: "Me endpoint" });
};

// OTP LOGIN LOGIC
exports.sendOtp = async (req, res) => {
    try {
        const { email: identifier } = req.body;
        if (!identifier) return res.status(400).json({ error: "Email or Phone is required" });

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) return res.status(404).json({ error: "No account found with this credential" });

        const code = crypto.randomInt(100000, 999999).toString();

        await OTP.findOneAndUpdate(
            { identifier },
            { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            { upsert: true, returnDocument: 'after' }
        );

        if (!isEmail) {
            console.log(`\n===========================================`);
            console.log(`🔐 OTP LOGIN CODE FOR ${identifier} IS: ${code}`);
            console.log(`===========================================\n`);
            console.log(`[Twilio SMS Placeholder] - Phone Detected. (Set TWILIO_ACCOUNT_SID in .env to send real SMS to ${identifier})`);
        } else {
            console.log(`\n===========================================`);
            console.log(`🔐 OTP LOGIN CODE FOR ${identifier} IS: ${code}`);
            console.log(`===========================================\n`);

            try {
                const sendEmail = require('../utils/email');
                await sendEmail({
                    to: identifier,
                    subject: 'Your Dashboard OTP Login Code',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>Login Verification</h2>
                            <p>Your secure one-time passcode is:</p>
                            <h1 style="color: #6366f1; letter-spacing: 5px;">${code}</h1>
                            <p>This code will automatically expire in 10 minutes.</p>
                        </div>
                    `
                });
                console.log(`[Email Dispatched] - OTP sent via SMTP to ${identifier}`);
            } catch (smtpErr) {
                console.error('[SMTP Error] - Failed to fire email:', smtpErr.message);
            }
        }

        res.status(200).json({ success: true, message: "OTP Generated successfully" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: "Credential and code are required" });

        const otpRecord = await OTP.findOne({ identifier: email, code });
        if (!otpRecord) return res.status(401).json({ error: "Invalid or expired OTP code" });

        const user = await User.findOne({
            $or: [{ email: email }, { phone: email }]
        });
        if (!user) return res.status(404).json({ error: "User associated with OTP no longer exists" });

        const token = generateToken(user._id);

        // Delete successful OTP so it can't be reused
        await otpRecord.deleteOne();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
}

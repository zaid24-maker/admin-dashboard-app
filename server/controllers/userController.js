const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET /api/users/me — get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// PUT /api/users/me — update name, email, phone
exports.updateMe = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        console.log(`[PROFILE_UPDATE] Attempting to update user: ${req.user.id}`);
        console.log(`[PROFILE_UPDATE] Payload received — Name: ${name}, Email: ${email}, Phone: ${phone}`);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        console.log(`[PROFILE_UPDATE] Success! Saved user:`, user);
        res.json({ success: true, data: user });
    } catch (err) {
        console.error(`[PROFILE_UPDATE] FAILED:`, err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// PUT /api/users/me/password — change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
        user.password = newPassword;
        await user.save(); // pre-save hook hashes it
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// GET /api/users — list all users (admin view, same tenant)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// PATCH /api/users/:id/role — update user role
exports.updateRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { returnDocument: 'after' }
        ).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};

// PATCH /api/users/:id/toggle — activate/deactivate user
exports.toggleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
};

// POST /api/users/avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No physical image binary was transmitted." });
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { returnDocument: 'after' }
        ).select('-password');

        res.json({ success: true, data: user, message: "Avatar securely mounted." });
    } catch (err) {
        console.error("Avatar Upload Error:", err);
        res.status(500).json({ error: "Critical failure uploading avatar payload." });
    }
};

// PUT /api/users/:id/target
exports.updateTarget = async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Owner') {
            return res.status(403).json({ error: 'Strictly reserved for Admins' });
        }
        const { target } = req.body;
        if (typeof target !== 'number') return res.status(400).json({ error: 'Target must be numeric' });

        const user = await User.findByIdAndUpdate(req.params.id, { workTarget: target }, { returnDocument: 'after' }).select('-password');
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ error: "Server error overriding structural arrays." });
    }
};

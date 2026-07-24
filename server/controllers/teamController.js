const User = require('../models/User');
const sendEmail = require('../utils/email');

exports.getTeamMembers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ error: "Server Error fetching team" });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Owner') {
            return res.status(403).json({ error: "Only global Admins can invite new teammates." });
        }

        const { email, role } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required to dispatch invite." });

        const tempPassword = Math.random().toString(36).slice(-8);

        const user = await User.create({
            name: "Invited Member",
            email,
            password: tempPassword,
            role: role || 'Viewer',
            isActive: true
        });

        const appUrl = 'http://localhost:5173/login';

        await sendEmail({
            to: email,
            subject: 'You have been invited to the Secure Dashboard!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; line-height: 1.6;">
                   <h2 style="color: #6366f1;">Welcome to the Team!</h2>
                   <p>Your team admin has officially invited you to join the automation platform with <b>${role || 'Viewer'}</b> privileges.</p>
                   <p>Your highly secure, temporary login credentials are:</p>
                   <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                       <p><b>Email:</b> ${email}</p>
                       <p><b>Temporary Password:</b> <span style="letter-spacing: 2px;">${tempPassword}</span></p>
                   </div>
                   <a href="${appUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Access Dashboard</a>
                   <p style="margin-top: 25px; font-size: 12px; color: #64748b;">*Please change your password immediately upon logging in via the Security tab in Settings.</p>
                </div>
            `
        });

        res.status(201).json({ success: true, message: `Invite successfully dispatched to ${email}` });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "A user with that email already exists on the network." });
        console.error("Invite Dispatch Error:", err);
        res.status(500).json({ error: "Failed to dispatch email invite over SMTP." });
    }
};

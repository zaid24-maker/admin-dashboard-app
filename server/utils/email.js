const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    // Check if configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('SMTP credentials (EMAIL_USER, EMAIL_PASS) are missing in the .env file');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Defaulting to Gmail SMTP (port 465)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `Automation Engine <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
};

module.exports = sendEmail;

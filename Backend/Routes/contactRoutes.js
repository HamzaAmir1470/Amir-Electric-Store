const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ---------------- EMAIL SETUP ----------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
// Verify email connection on startup
const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log("Email server is ready");
    } catch (error) {
        console.log("Email setup error:", error.message);
    }
};

testEmailConnection();

// ---------------- BASIC RATE LIMIT (simple protection) ----------------
const sentEmails = new Map();

// ---------------- ROUTE ----------------
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Get IP for spam protection
    const ip = req.ip;

    const lastSent = sentEmails.get(ip);
    if (lastSent && Date.now() - lastSent < 60000) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please wait before sending again."
        });
    }

    sentEmails.set(ip, Date.now());

    // ---------------- VALIDATION ----------------
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    try {
        // ---------------- OWNER EMAIL ----------------
        const ownerMailOptions = {
            from: process.env.EMAIL_USER,
            to: "mh041829@gmail.com",
            subject: `New Contact Message from ${name}`,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: auto;">
                    <h2 style="color:#2563eb;">New Contact Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background:#f3f4f6;padding:10px;border-radius:5px;">
                        ${message}
                    </p>
                </div>
            `
        };

        // ---------------- AUTO REPLY ----------------
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for contacting Amir Electric Store",
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: auto;">
                    <h2 style="color:#2563eb;">Thank You!</h2>
                    <p>Dear ${name},</p>
                    <p>We received your message and will respond within 24 hours.</p>

                    <p><strong>Your Message:</strong></p>
                    <p style="background:#f3f4f6;padding:10px;border-radius:5px;">
                        ${message}
                    </p>

                    <hr />
                    <p>📞 +92 322 4385445</p>
                    <p>📍 Amir Electric Store, Lahore</p>
                </div>
            `
        };

        // ---------------- SEND EMAILS ----------------
        await Promise.all([
            transporter.sendMail(ownerMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        return res.status(200).json({
            success: true,
            message: "Message sent successfully!"
        });

    } catch (error) {
        console.error("Email error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again."
        });
    }
});

module.exports = router;
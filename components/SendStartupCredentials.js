const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sendStartupCredentials = async (toEmail, password) => {
    const smtpHost = "smtpout.secureserver.net";
    const smtpPort = Number(465);
    const smtpSecure ="true"
        
    const smtpUser = process.env.GMAIL_USER;
    const smtpPass = process.env.GMAIL_APP_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
    });
    try {
        const info = await transporter.sendMail({
            from: `"NIRMAAN" <${smtpUser}>`,
            to: toEmail,
            subject: "Welcome to NIRMAAN - Your Startup Credentials",
            text: `Dear Startup,\n\nYour account has been created.\n\nLogin Email: ${toEmail}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nBest,\nNIRMAAN Team`
        });
        return info;
    } catch (err) {
        throw err;
    }
};

module.exports = sendStartupCredentials; 
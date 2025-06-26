const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sendStartupCredentials = async (toEmail, password) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "krish21498@gmail.com",
            pass: process.env.PASS_KEY
        },
    });
    try {
        const info = await transporter.sendMail({
            from: '"NIRMAAN" <krish21498@gmail.com>',
            to: toEmail,
            subject: "Welcome to NIRMAAN - Your Startup Credentials",
            text: `Dear Startup,\n\nYour account has been created.\n\nLogin Email: ${toEmail}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nBest,\nNIRMAAN Team`
        });
        return info;
    } catch (err) {
        return err;
    }
};

module.exports = sendStartupCredentials; 
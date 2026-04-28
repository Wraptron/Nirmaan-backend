const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const ForgotPassword = async (email, otp) => {
    const smtpHost = "smtpout.secureserver.net";
    const smtpPort = Number(465);
    const smtpSecure = process.env.SMTP_SECURE
        ? "true"
        : smtpPort === 465;
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
    try
    {
        const info = await transporter.sendMail({
            from: `"NIRMAAN" <${smtpUser}>`,
            to: email,
            subject: "Nirmaan Password Reset OTP",
            text: `Your OTP for password reset is ${otp}. This OTP is valid for 5 minutes.`,
          });
          return info;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports = ForgotPassword;
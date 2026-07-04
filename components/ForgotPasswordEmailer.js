const transporter = require("../utils/mailer");

const ForgotPassword = async (email, otp) => {
  const smtpUser = process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"NIRMAAN" <${smtpUser}>`,
    to: email,
    subject: "Nirmaan Password Reset OTP",
    text: `Your OTP for password reset is ${otp}. This OTP is valid for 5 minutes.`,
  });
  return info;
};

module.exports = ForgotPassword;

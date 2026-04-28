const {
  requestOtp,
  resendOtp,
  verifyOtpAndResetPassword,
} = require("../../../model/ForgotPasswordOtpModel");

const requestForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to send OTP.", error: err.message });
  }
};

const resendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to resend OTP.", error: err.message });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    const result = await verifyOtpAndResetPassword(email, otp, new_password);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reset password.", error: err.message });
  }
};

module.exports = {
  requestForgotPasswordOtp,
  resendForgotPasswordOtp,
  verifyForgotPasswordOtp,
};
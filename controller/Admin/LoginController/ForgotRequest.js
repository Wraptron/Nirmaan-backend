const {
  requestOtp,
  resendOtp,
  verifyOtpAndResetPassword,
} = require("../../../model/ForgotPasswordOtpModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const requestForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    sendErrorResponse(res, 500, "Failed to send OTP.", err, {
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

const resendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    sendErrorResponse(res, 500, "Failed to resend OTP.", err, {
      success: false,
      message: "Failed to resend OTP.",
    });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    const result = await verifyOtpAndResetPassword(email, otp, new_password);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    sendErrorResponse(res, 500, "Failed to reset password.", err, {
      success: false,
      message: "Failed to reset password.",
    });
  }
};

module.exports = {
  requestForgotPasswordOtp,
  resendForgotPasswordOtp,
  verifyForgotPasswordOtp,
};

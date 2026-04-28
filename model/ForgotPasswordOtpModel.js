const client = require("../utils/conn");
const bcrypt = require("bcrypt");
const NewPasswordValidation = require("../validation/NewPasswordValidation");
const ForgotPasswordEmailer = require("../components/ForgotPasswordEmailer");

const OTP_VALIDITY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const otpStore = new Map();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getWaitSeconds = (ms) => Math.max(1, Math.ceil(ms / 1000));

const getUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    client.query(
      "SELECT user_mail FROM user_data WHERE user_mail = $1",
      [email],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.rows[0] || null);
      }
    );
  });

const updatePasswordByEmail = (email, hashedPassword) =>
  new Promise((resolve, reject) => {
    client.query(
      "UPDATE user_data SET user_password = $1 WHERE user_mail = $2",
      [hashedPassword, email],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.rowCount > 0);
      }
    );
  });

const saveOtpForEmail = (email, otp) => {
  const now = Date.now();
  otpStore.set(email, {
    otp,
    expiresAt: now + OTP_VALIDITY_MS,
    lastSentAt: now,
  });
};

const requestOtp = async (email) => {
  const emailLower = String(email || "").trim().toLowerCase();
  if (!emailLower) {
    return { success: false, message: "Email is required." };
  }

  const user = await getUserByEmail(emailLower);
  if (!user) {
    return { success: false, message: "Email does not exist." };
  }

  const otp = generateOtp();
  await ForgotPasswordEmailer(emailLower, otp);
  saveOtpForEmail(emailLower, otp);

  return {
    success: true,
    message: "OTP sent successfully.",
    expiresInSeconds: OTP_VALIDITY_MS / 1000,
    resendAvailableInSeconds: RESEND_COOLDOWN_MS / 1000,
  };
};

const resendOtp = async (email) => {
  const emailLower = String(email || "").trim().toLowerCase();
  if (!emailLower) {
    return { success: false, message: "Email is required." };
  }

  const user = await getUserByEmail(emailLower);
  if (!user) {
    return { success: false, message: "Email does not exist." };
  }

  const existing = otpStore.get(emailLower);
  const now = Date.now();
  if (existing) {
    const timeSinceLastSend = now - existing.lastSentAt;
    if (timeSinceLastSend < RESEND_COOLDOWN_MS) {
      return {
        success: false,
        message: "Please wait before resending OTP.",
        resendAvailableInSeconds: getWaitSeconds(RESEND_COOLDOWN_MS - timeSinceLastSend),
      };
    }
  }

  const otp = generateOtp();
  await ForgotPasswordEmailer(emailLower, otp);
  saveOtpForEmail(emailLower, otp);

  return {
    success: true,
    message: "OTP resent successfully.",
    expiresInSeconds: OTP_VALIDITY_MS / 1000,
    resendAvailableInSeconds: RESEND_COOLDOWN_MS / 1000,
  };
};

const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
  const emailLower = String(email || "").trim().toLowerCase();
  const otpValue = String(otp || "").trim();

  if (!emailLower || !otpValue || !newPassword) {
    return { success: false, message: "Email, OTP and new password are required." };
  }

  if (!NewPasswordValidation(newPassword)) {
    return {
      success: false,
      message:
        "Password must be 8-15 chars with uppercase, lowercase, number and special character.",
    };
  }

  const storedOtp = otpStore.get(emailLower);
  if (!storedOtp) {
    return { success: false, message: "OTP not found. Please request OTP again." };
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(emailLower);
    return { success: false, message: "OTP expired. Please request a new OTP." };
  }

  if (storedOtp.otp !== otpValue) {
    return { success: false, message: "Invalid OTP." };
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const updated = await updatePasswordByEmail(emailLower, hashedPassword);

  if (!updated) {
    return { success: false, message: "User not found." };
  }

  otpStore.delete(emailLower);
  return { success: true, message: "Password reset successful. Please login." };
};

module.exports = {
  requestOtp,
  resendOtp,
  verifyOtpAndResetPassword,
};

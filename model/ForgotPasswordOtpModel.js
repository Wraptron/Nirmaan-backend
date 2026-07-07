const pool = require("../utils/conn");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const NewPasswordValidation = require("../validation/NewPasswordValidation");
const ForgotPasswordEmailer = require("../components/ForgotPasswordEmailer");

const OTP_VALIDITY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const OTP_REQUEST_MESSAGE = "OTP sent to registered email.";

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const getWaitSeconds = (ms) => Math.max(1, Math.ceil(ms / 1000));

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function ensureOtpTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otp (
      email       TEXT PRIMARY KEY,
      otp         TEXT NOT NULL,
      expires_at  BIGINT NOT NULL,
      last_sent_at BIGINT NOT NULL
    )
  `);
}

const tableReady = ensureOtpTable().catch((err) =>
  console.error("Failed to create password_reset_otp table:", err.message)
);

async function getStoredOtp(email) {
  await tableReady;
  const { rows } = await pool.query(
    "SELECT otp, expires_at, last_sent_at FROM password_reset_otp WHERE email = $1",
    [email]
  );
  if (rows.length === 0) return null;
  return {
    otp: rows[0].otp,
    expiresAt: Number(rows[0].expires_at),
    lastSentAt: Number(rows[0].last_sent_at),
  };
}

async function saveOtpForEmail(email, otp) {
  await tableReady;
  const now = Date.now();
  const hashedOtp = await bcrypt.hash(otp, 10);
  await pool.query(
    `INSERT INTO password_reset_otp (email, otp, expires_at, last_sent_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET otp = EXCLUDED.otp,
           expires_at = EXCLUDED.expires_at,
           last_sent_at = EXCLUDED.last_sent_at`,
    [email, hashedOtp, now + OTP_VALIDITY_MS, now]
  );
}

async function deleteOtp(email) {
  await tableReady;
  await pool.query("DELETE FROM password_reset_otp WHERE email = $1", [email]);
}

async function cleanupExpiredOtps() {
  await tableReady;
  const { rowCount } = await pool.query(
    "DELETE FROM password_reset_otp WHERE expires_at < $1",
    [Date.now()]
  );
  if (rowCount > 0) {
    console.log(`Cleaned up ${rowCount} expired OTP(s)`);
  }
}

// Periodic cleanup every 10 minutes
setInterval(cleanupExpiredOtps, CLEANUP_INTERVAL_MS);

// ─── User DB helpers ──────────────────────────────────────────────────────────

async function getUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT user_mail FROM user_data WHERE user_mail = $1",
    [email]
  );
  return rows[0] || null;
}

async function updatePasswordByEmail(email, hashedPassword) {
  const { rowCount } = await pool.query(
    "UPDATE user_data SET user_password = $1 WHERE user_mail = $2",
    [hashedPassword, email]
  );
  return rowCount > 0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const otpRequestResponse = () => ({
  success: true,
  message: OTP_REQUEST_MESSAGE,
  expiresInSeconds: OTP_VALIDITY_MS / 1000,
  resendAvailableInSeconds: RESEND_COOLDOWN_MS / 1000,
});

const requestOtp = async (email) => {
  const emailLower = String(email || "").trim().toLowerCase();
  if (!emailLower) {
    return { success: false, message: "Email is required." };
  }

  const user = await getUserByEmail(emailLower);
  if (!user) {
    return otpRequestResponse();
  }

  const otp = generateOtp();
  await ForgotPasswordEmailer(emailLower, otp);
  await saveOtpForEmail(emailLower, otp);

  return otpRequestResponse();
};

const resendOtp = async (email) => {
  const emailLower = String(email || "").trim().toLowerCase();
  if (!emailLower) {
    return { success: false, message: "Email is required." };
  }

  const user = await getUserByEmail(emailLower);
  if (!user) {
    return otpRequestResponse();
  }

  const existing = await getStoredOtp(emailLower);
  const now = Date.now();
  if (existing) {
    const timeSinceLastSend = now - existing.lastSentAt;
    if (timeSinceLastSend < RESEND_COOLDOWN_MS) {
      return {
        success: false,
        message: "Please wait before resending OTP.",
        resendAvailableInSeconds: getWaitSeconds(
          RESEND_COOLDOWN_MS - timeSinceLastSend
        ),
      };
    }
  }

  const otp = generateOtp();
  await ForgotPasswordEmailer(emailLower, otp);
  await saveOtpForEmail(emailLower, otp);

  return otpRequestResponse();
};

const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
  const emailLower = String(email || "").trim().toLowerCase();
  const otpValue = String(otp || "").trim();

  if (!emailLower || !otpValue || !newPassword) {
    return {
      success: false,
      message: "Email, OTP and new password are required.",
    };
  }

  if (!NewPasswordValidation(newPassword)) {
    return {
      success: false,
      message:
        "Password must be 8-15 chars with uppercase, lowercase, number and special character.",
    };
  }

  const storedOtp = await getStoredOtp(emailLower);
  if (!storedOtp) {
    return {
      success: false,
      message: "OTP not found. Please request OTP again.",
    };
  }

  if (Date.now() > storedOtp.expiresAt) {
    await deleteOtp(emailLower);
    return { success: false, message: "OTP expired. Please request a new OTP." };
  }

  const otpMatches = await bcrypt.compare(otpValue, storedOtp.otp);
  if (!otpMatches) {
    return { success: false, message: "Invalid OTP." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await updatePasswordByEmail(emailLower, hashedPassword);

  if (!updated) {
    return { success: false, message: "User not found." };
  }

  await deleteOtp(emailLower);
  return { success: true, message: "Password reset successful. Please login." };
};

module.exports = {
  requestOtp,
  resendOtp,
  verifyOtpAndResetPassword,
};

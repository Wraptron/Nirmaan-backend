const pool = require("../../../utils/conn");
const bcrypt = require("bcrypt");
const NewPasswordValidation = require("../../../validation/NewPasswordValidation");

const ChangePassword = async (req, res) => {
  try {
    const userMail = req.user?.user_mail;
    if (!userMail) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current password and new password are required." });
    }

    if (!NewPasswordValidation(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-15 chars with uppercase, lowercase, number and special character.",
      });
    }

    const { rows } = await pool.query(
      "SELECT user_password FROM user_data WHERE user_mail = $1",
      [userMail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const storedPassword = rows[0].user_password || "";
    const isBcryptHash = storedPassword.startsWith("$2");
    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(currentPassword, storedPassword)
      : storedPassword === currentPassword;

    if (!passwordMatches) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE user_data SET user_password = $1 WHERE user_mail = $2",
      [hashedNewPassword, userMail]
    );

    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to change password." });
  }
};

module.exports = ChangePassword;

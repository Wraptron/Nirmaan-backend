const db = require("../../../utils/conn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const NewPasswordValidation = require("../../../validation/NewPasswordValidation");

const passwordMatches = (plainPassword, storedPassword) => {
  const stored = storedPassword || "";
  if (stored.startsWith("$2")) {
    return bcrypt.compareSync(plainPassword, stored);
  }
  return stored === plainPassword;
};

const ChangePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      return res.status(403).json({
        message: "Invalid or expired token. Please login again.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (!NewPasswordValidation(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-15 chars with uppercase, lowercase, number and special character.",
      });
    }

    const userResult = await db.query(
      "SELECT user_mail, user_password FROM user_data WHERE user_mail = $1",
      [decoded.user_mail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    if (!passwordMatches(currentPassword, user.user_password)) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.query(
      "UPDATE user_data SET user_password = $1 WHERE user_mail = $2",
      [hashedPassword, decoded.user_mail]
    );

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = ChangePassword;

const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const {
  REFRESH_TOKEN_COOKIE,
  setAccessTokenCookie,
} = require("../../../utils/authCookies");
const { signAccessToken } = require("../../../utils/tokens");
const getUserAuthContext = require("../../../model/getUserAuthContext");

const RefreshController = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await getUserAuthContext(decoded.sub);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(user.user_mail);
    setAccessTokenCookie(res, accessToken);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(403).json({
      message:
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid refresh token",
    });
  }
};

module.exports = RefreshController;

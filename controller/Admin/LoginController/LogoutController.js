const { clearAuthCookies } = require("../../../utils/authCookies");

const LogoutController = (_req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ ok: true });
};

module.exports = LogoutController;

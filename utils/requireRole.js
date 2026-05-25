const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = String(req.user?.role ?? "");
  const allowed = allowedRoles.map(String);
  if (!allowed.includes(role)) {
    return res.status(403).json({ message: "You do not have access to this action." });
  }
  next();
};

module.exports = requireRole;

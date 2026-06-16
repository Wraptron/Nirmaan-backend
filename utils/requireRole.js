const FINANCE_ROLES = new Set(["2", "3"]);
const STARTUP_ROLE = "5";

const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = String(req.user?.role ?? "");
  const allowed = allowedRoles.map(String);
  if (!allowed.includes(role)) {
    return res.status(403).json({ message: "You do not have access to this action." });
  }
  next();
};

const canAccessFundingRecord = (user, record) => {
  if (!user || !record) return false;
  const role = String(user.role ?? "");
  if (FINANCE_ROLES.has(role)) return true;
  if (
    role === STARTUP_ROLE &&
    String(user.startup_id) === String(record.startup_id)
  ) {
    return true;
  }
  return false;
};

const assertCanModifyFunding = (user, startupId, fundingType) => {
  if (!user) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const role = String(user.role ?? "");

  if (FINANCE_ROLES.has(role)) {
    return;
  }

  if (role === STARTUP_ROLE) {
    if (String(user.startup_id) !== String(startupId)) {
      const error = new Error("You can only add funding for your own startup.");
      error.statusCode = 403;
      throw error;
    }

    if (
      fundingType === "Funding Disbursed" ||
      fundingType === "External Funding"
    ) {
      const error = new Error("You do not have permission for this funding type.");
      error.statusCode = 403;
      throw error;
    }

    return;
  }

  const error = new Error("You do not have access to this action.");
  error.statusCode = 403;
  throw error;
};

module.exports = requireRole;
module.exports.canAccessFundingRecord = canAccessFundingRecord;
module.exports.assertCanModifyFunding = assertCanModifyFunding;

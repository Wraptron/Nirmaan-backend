const { CheckUserByEmail } = require("../model/StartupModel");

const ADMIN_ROLE = 2;
const STARTUP_ROLE = 5;

const isStartupAdmin = (requester) => Number(requester?.role) === ADMIN_ROLE;

const canAccessStartup = (requester, startupId) => {
  if (!requester || startupId == null || startupId === "") return false;
  if (isStartupAdmin(requester)) return true;
  if (Number(requester.role) === STARTUP_ROLE) {
    return String(requester.startup_id) === String(startupId);
  }
  return false;
};

const denyUnlessStartupAccess = (res, requester, startupId) => {
  if (!canAccessStartup(requester, startupId)) {
    res.status(403).json({
      message: "You do not have permission to access this startup.",
    });
    return true;
  }
  return false;
};

/**
 * Resolves the authoritative startup_id for a mutation.
 * Role 5: always binds to req.user.startup_id; rejects client mismatches.
 * Role 2: uses startup_id/user_id from the client, or resolves via email.
 */
const resolveStartupTarget = async (
  requester,
  { startup_id, user_id, email_address } = {}
) => {
  const clientId = startup_id ?? user_id;

  if (isStartupAdmin(requester)) {
    if (clientId != null && clientId !== "") return String(clientId);
    if (email_address) {
      const row = await CheckUserByEmail(email_address);
      return row?.user_id != null ? String(row.user_id) : null;
    }
    return null;
  }

  if (Number(requester?.role) !== STARTUP_ROLE || !requester.startup_id) {
    return null;
  }

  const ownId = String(requester.startup_id);

  if (clientId != null && clientId !== "" && String(clientId) !== ownId) {
    return null;
  }

  if (email_address) {
    const row = await CheckUserByEmail(email_address);
    if (!row || String(row.user_id) !== ownId) {
      return null;
    }
  }

  return ownId;
};

module.exports = {
  isStartupAdmin,
  canAccessStartup,
  denyUnlessStartupAccess,
  resolveStartupTarget,
};

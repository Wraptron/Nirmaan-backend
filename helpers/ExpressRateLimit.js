const rateLimit = require("express-rate-limit");

// Set LOAD_TEST_MODE=true when running k6 so per-IP limits do not mask capacity.
const loadTestMode = process.env.LOAD_TEST_MODE === "true";

const AUTH_PATHS = new Set([
  "/login",
  "/forgot-password",
  "/forgot-password/request-otp",
  "/forgot-password/resend-otp",
  "/forgot-password/verify-otp",
  "/auth/refresh",
  "/auth/logout",
]);

const UPLOAD_PATHS = new Set([
  "/resumeupload",
  "/ipdataupload",
  "/teamdoc-upload",
  "/addstartup/award",
  "/updateaward",
  "/mentor/add",
  "/mentor/update",
  "/create-events",
  "/edit-event/",
]);

const isUploadPath = (reqPath, method) => {
  if (UPLOAD_PATHS.has(reqPath)) {
    return true;
  }
  return method === "PUT" && reqPath === "/edit-startupdata/personal-info";
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "Too many attempts, please try again later." },
  skip: () => loadTestMode,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "Too many uploads, please slow down." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "Too many requests, please slow down." },
  skip: (req) =>
    loadTestMode ||
    AUTH_PATHS.has(req.path) ||
    isUploadPath(req.path, req.method),
});

module.exports = { authLimiter, uploadLimiter, apiLimiter };

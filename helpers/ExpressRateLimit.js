const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMs, max }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "Too many requests" },
  });

const globalRateLimit = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
});

const authRateLimit = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
});

module.exports = {
  RateLimitMiddleware: authRateLimit,
  globalRateLimit,
  authRateLimit,
};

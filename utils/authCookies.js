const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const isProduction = process.env.NODE_ENV === "production";
// Strict is correct when the SPA and API share the same site. For cross-origin
// deployments (e.g. app on sieiitm.org, API on api.sieiitm.org), set
// COOKIE_SAME_SITE=none in .env (requires secure: true).
const sameSite = process.env.COOKIE_SAME_SITE || "strict";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction || sameSite === "none",
  sameSite,
};

const accessTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE_MS,
};

const refreshTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  path: "/api/v1/auth",
};

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const setAccessTokenCookie = (res, token) => {
  res.cookie(ACCESS_TOKEN_COOKIE, token, accessTokenCookieOptions);
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, refreshTokenCookieOptions);
};

const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction || sameSite === "none",
  sameSite,
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, clearAuthCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...clearAuthCookieOptions,
    path: "/api/v1/auth",
  });
};

module.exports = {
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
};

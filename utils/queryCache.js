const NodeCache = require("node-cache");

const DEFAULT_TTL_SECONDS =
  parseInt(process.env.QUERY_CACHE_TTL_SECONDS, 10) || 45;

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: Math.min(DEFAULT_TTL_SECONDS, 60),
  useClones: false,
});

const CACHE_KEYS = {
  STARTUP_COUNTS: "count-startupdata",
  MENTOR_COUNT: "mentor-count",
  MENTOR_LIST: "mentor-list",
  FUNDING_TOTALS: "funding-totals",
  EVENTS_LIST: "events-list",
  CONNECTIONS_LIST: "connections-list",
};

/**
 * Per-key TTL overrides. Longer TTL = fewer DB hits but slightly staler data.
 * Startup/mentor counts and event lists change infrequently on the dashboard.
 */
const TTL_BY_KEY = {
  // Startup counts rarely need second-fresh accuracy on the overview dashboard.
  [CACHE_KEYS.STARTUP_COUNTS]: 120,
  [CACHE_KEYS.MENTOR_COUNT]: 90,
  [CACHE_KEYS.MENTOR_LIST]: 90,
  [CACHE_KEYS.FUNDING_TOTALS]: 120,
  [CACHE_KEYS.EVENTS_LIST]: 90,
  [CACHE_KEYS.CONNECTIONS_LIST]: 90,
};

function resolveTtl(key, ttlSeconds) {
  if (ttlSeconds != null) return ttlSeconds;
  return TTL_BY_KEY[key] ?? DEFAULT_TTL_SECONDS;
}

async function getOrSet(key, fetchFn, ttlSeconds) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await fetchFn();
  cache.set(key, value, resolveTtl(key, ttlSeconds));
  return value;
}

function invalidate(...keys) {
  keys.forEach((key) => cache.del(key));
}

function invalidateStartupCaches() {
  invalidate(CACHE_KEYS.STARTUP_COUNTS);
}

function invalidateMentorCaches() {
  invalidate(CACHE_KEYS.MENTOR_COUNT, CACHE_KEYS.MENTOR_LIST);
}

function invalidateFundingCaches() {
  invalidate(CACHE_KEYS.FUNDING_TOTALS);
}

function invalidateEventCaches() {
  invalidate(CACHE_KEYS.EVENTS_LIST);
}

function invalidateConnectionCaches() {
  invalidate(CACHE_KEYS.CONNECTIONS_LIST);
}

module.exports = {
  CACHE_KEYS,
  TTL_BY_KEY,
  getOrSet,
  invalidate,
  invalidateStartupCaches,
  invalidateMentorCaches,
  invalidateFundingCaches,
  invalidateEventCaches,
  invalidateConnectionCaches,
};

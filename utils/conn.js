const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Supavisor transaction pooler (port 6543) multiplexes many app clients onto
 * fewer Postgres connections. Set DB_USE_TRANSACTION_POOLER=true or use a
 * DATABASE_URL on port 6543. prepareThreshold: 0 is required because
 * transaction-mode poolers do not support prepared statements.
 *
 * Session-level features NOT used in this codebase: LISTEN/NOTIFY, advisory
 * locks, temp tables across requests. withTransaction (BEGIN/COMMIT) is
 * supported on the transaction pooler for a single held client.
 */
const useTransactionPooler =
  process.env.DB_USE_TRANSACTION_POOLER === "true" ||
  /:6543(\/|$)/.test(process.env.DATABASE_URL || "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10) || 10000,
  ...(useTransactionPooler && { prepareThreshold: 0 }),
});

if (useTransactionPooler) {
  console.log(
    "PostgreSQL pool: transaction-mode pooler detected (prepared statements disabled)"
  );
}

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("Connected successfully!!"))
  .catch((err) => console.error("Connection error:", err));

/**
 * Runs callback on a single pooled connection inside a transaction.
 * Use for BEGIN/COMMIT/ROLLBACK flows instead of pool.query().
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = pool;
module.exports.pool = pool;
module.exports.withTransaction = withTransaction;

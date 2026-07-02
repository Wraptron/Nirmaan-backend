const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10) || 10000,
});

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

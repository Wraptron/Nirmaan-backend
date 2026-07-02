const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

pool
  .query("SELECT 1")
  .then(() => console.log("Connected successfully!!"))
  .catch((err) => console.error("Connection error:", err));

module.exports = pool;

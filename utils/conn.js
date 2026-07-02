const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const client = new Client({
  connectionString,
});

client.on("error", (err) => {
  console.error("PostgreSQL client error:", err);
});

(async () => {
  try {
    await client.connect();
    console.log("Connected successfully!!");
  } catch (err) {
    console.error("Connection error:", err);
  }
})();

module.exports = client;
const { Client } = require("pg");

//const connectionString = "postgres://postgres:Supabase%401234@db.rcoyvhpccbezoprhqhwy.supabase.co:5432/postgres";
const connectionString = "postgresql://postgres.rcoyvhpccbezoprhqhwy:Supabase%401234@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
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
// const { Client } = require("pg");
// const dotenv = require("dotenv");
// dotenv.config();
// const client = new Client({
//   host: "localhost",
//   user: "postgres",
//   port: "5433",
//   password: "1234",
//   database: "nirmaandb"
// })
// client.connect(function(err) {
//   if(err) throw err;
//   else
//   {
//     console.log("connected testt");
//   }
// });
// module.exports = client;
// db.js
const { Client } = require("pg");

//const connectionString = "postgres://postgres:Supabase%401234@db.rcoyvhpccbezoprhqhwy.supabase.co:5432/postgres";
const connectionString = "postgresql://postgres.rcoyvhpccbezoprhqhwy:Supabase%401234@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
const client = new Client({
  connectionString,
});

client.connect((err) => {
  if (err) console.error("Connection error:", err.stack);
  else console.log("Connected successfully!!");
});

module.exports = client;
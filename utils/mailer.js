const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const smtpHost = "smtpout.secureserver.net";
const smtpPort = 465;
const smtpUser = process.env.GMAIL_USER;
const smtpPass = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP transporter verification failed:", err.message);
  } else {
    console.log("SMTP transporter ready (pooled, max 5 connections)");
  }
});

module.exports = transporter;

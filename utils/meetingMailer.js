const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const client = require("./conn");

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

const fetchMentorEmail = (mentorId) =>
  new Promise((resolve, reject) => {
    if (!mentorId) return resolve(null);
    client.query(
      "SELECT email_address, mentor_name FROM mentors WHERE mentor_id = $1 LIMIT 1",
      [String(mentorId)],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0] || null);
      }
    );
  });

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const parts = String(timeStr).slice(0, 5).split(":");
  if (parts.length < 2) return timeStr;
  let h = Number(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

/**
 * Send a session-scheduled email to the mentor.
 * Silently logs on failure so it never blocks the main flow.
 */
const sendMentorSessionEmail = async ({
  mentorId,
  startupName,
  founderName,
  date,
  time,
  duration,
  mode,
  meetingLink,
  agenda,
}) => {
  try {
    const mentor = await fetchMentorEmail(mentorId);
    if (!mentor?.email_address) {
      console.warn("sendMentorSessionEmail: no email found for mentor", mentorId);
      return;
    }

    const mentorEmail = mentor.email_address;
    const mentorName = mentor.mentor_name || "Mentor";

    const isOnline = String(mode || "").toLowerCase() === "online" ||
                     String(mode || "").toLowerCase() === "virtual";

    const linkSection = isOnline && meetingLink
      ? `Meeting Link: ${meetingLink}`
      : "";

    const subject = `New Mentorship Session Scheduled – ${startupName || "Startup"}`;

    const text = [
      `Dear ${mentorName},`,
      "",
      `A mentorship session has been scheduled with you.`,
      "",
      `Startup: ${startupName || "N/A"}`,
      `Founder / Contact: ${founderName || "N/A"}`,
      `Date: ${formatDate(date)}`,
      `Time: ${formatTime(time)}`,
      `Duration: ${duration || "N/A"}`,
      `Mode: ${isOnline ? "Online" : "In Person"}`,
      linkSection,
      `Agenda: ${agenda || "Not specified"}`,
      "",
      "Please be available at the scheduled time.",
      "",
      "Best regards,",
      "NIRMAAN Team",
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #232323;">New Mentorship Session Scheduled</h2>
        <p>Dear <strong>${mentorName}</strong>,</p>
        <p>A mentorship session has been scheduled with you. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb; width: 140px;">Startup</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${startupName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Founder / Contact</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${founderName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Date</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${formatDate(date)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Time</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${formatTime(time)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Duration</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${duration || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Mode</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${isOnline ? "Online" : "In Person"}</td>
          </tr>
          ${
            isOnline && meetingLink
              ? `<tr>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Meeting Link</td>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
                    <a href="${meetingLink}" style="color: #45C74D; text-decoration: underline;">${meetingLink}</a>
                  </td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 600; background: #f9fafb;">Agenda</td>
            <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${agenda || "Not specified"}</td>
          </tr>
        </table>
        <p>Please be available at the scheduled time.</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">Best regards,<br/>NIRMAAN Team</p>
      </div>
    `;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"NIRMAAN" <${process.env.GMAIL_USER}>`,
      to: mentorEmail,
      subject,
      text,
      html,
    });

    console.log(`Session email sent to mentor ${mentorName} (${mentorEmail})`);
  } catch (err) {
    console.error("sendMentorSessionEmail failed:", err);
  }
};

module.exports = { sendMentorSessionEmail };

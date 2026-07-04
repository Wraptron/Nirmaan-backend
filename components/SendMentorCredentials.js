const transporter = require("../utils/mailer");

const sendMentorCredentials = async (toEmail, password, mentorName) => {
  const smtpUser = process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"NIRMAAN" <${smtpUser}>`,
    to: toEmail,
    subject: "Welcome to NIRMAAN - Your Mentor Credentials",
    text: `Dear ${mentorName || "Mentor"},\n\nYour mentor account has been created on NIRMAAN.\n\nLogin Email: ${toEmail}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nBest Regards,\nNIRMAAN Team`,
  });
  return info;
};

module.exports = sendMentorCredentials;

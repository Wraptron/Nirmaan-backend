const transporter = require("../utils/mailer");

const sendStartupCredentials = async (toEmail, password) => {
  const smtpUser = process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"NIRMAAN" <${smtpUser}>`,
    to: toEmail,
    subject: "Welcome to NIRMAAN - Your Startup Credentials",
    text: `Dear Startup,\n\nYour account has been created.\n\nLogin Email: ${toEmail}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nBest,\nNIRMAAN Team`,
  });
  return info;
};

module.exports = sendStartupCredentials;

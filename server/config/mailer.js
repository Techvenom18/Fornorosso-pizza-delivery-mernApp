const nodemailer = require('nodemailer');

// Gmail example. For other providers, change 'service' to the correct SMTP host/port.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Without these, a dead SMTP connection makes requests hang for ~2 minutes
  // (which looked exactly like "login/signup is broken" in the browser).
  connectionTimeout: 10 * 1000,
  greetingTimeout: 10 * 1000,
  socketTimeout: 20 * 1000,
});

/**
 * Sends mail and NEVER throws: a broken/unreachable SMTP server must not break
 * signup or login. Errors are logged so they show up in the server/Render logs.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email skipped: EMAIL_USER / EMAIL_PASS missing from environment');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Pizza Delivery App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error(`Email send failed (to=${to}, subject="${subject}"):`, err.message);
    return false;
  }
};

module.exports = sendEmail;

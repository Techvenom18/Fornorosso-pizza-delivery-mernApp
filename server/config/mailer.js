const nodemailer = require('nodemailer');

// Gmail example. For other providers, change 'service' to the correct SMTP host/port.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Pizza Delivery App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Don't crash the request if email fails - just log it.
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
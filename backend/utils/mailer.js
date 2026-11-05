const nodemailer = require('nodemailer');

// Development test transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

/**
 * Send email notification or OTP
 */
async function sendEmail({ to, subject, html, text }) {
  console.log(`\n📧 [EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text || html}`);
  console.log(`----------------------------------------------------\n`);

  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'ethereal.user@ethereal.email') {
      const info = await transporter.sendMail({
        from: '"RUCHI Platform" <no-reply@ruchi.com>',
        to,
        subject,
        text,
        html,
      });
      return { success: true, messageId: info.messageId };
    }
    return { success: true, simulated: true };
  } catch (error) {
    console.warn('⚠️ SMTP send error (logged locally):', error.message);
    return { success: true, simulated: true };
  }
}

module.exports = { sendEmail };

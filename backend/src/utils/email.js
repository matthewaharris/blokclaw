import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_DEV_MODE === 'true' || !process.env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

export async function sendVerificationEmail(to, token, baseUrl) {
  const verifyUrl = `${baseUrl}/api/v1/providers/verify?token=${token}`;
  const transport = getTransporter();

  if (!transport) {
    console.log('\n📧 [DEV MODE] Verification email:');
    console.log(`   To: ${to}`);
    console.log(`   Verify URL: ${verifyUrl}\n`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || 'noreply@blokclaw.com',
    to,
    subject: 'Verify your BlokClaw account',
    html: `
      <h2>Welcome to BlokClaw!</h2>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `
  });
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: 465, // Using Port 465 as it is often preferred in cloud environments like Render
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to take messages');
  }
});

export async function sendCredentialsEmail(
  personalEmail: string,
  fullName: string,
  systemEmail: string,
  plainPassword: string,
  role: string
) {
  const roleLabel = role === 'super_admin' ? 'Super Admin'
    : role === 'manager' ? 'Manager'
    : 'Receptionist';

  const info = await transporter.sendMail({
    from: `"ServicePro Admin" <${process.env.MAIL_USER}>`,
    to: personalEmail,
    subject: `🔐 Credentials for your ServicePro Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e3a5f; margin-bottom: 4px;">Welcome to the Team!</h2>
        <p style="color: #6b7280; margin-top: 0;">Hi ${fullName}, your system access has been provisioned.</p>

        <div style="background: #f9fafb; border-radius: 6px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase;">Job Role</p>
          <p style="margin: 0 0 20px; font-weight: 600; color: #111827;">${roleLabel}</p>

          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase;">Login ID (System Email)</p>
          <code style="display: block; background: white; border: 1px solid #e5e7eb; padding: 10px; border-radius: 4px; font-weight: 600; color: #111827; margin-bottom: 20px;">${systemEmail}</code>

          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase;">Auto-Generated Password</p>
          <code style="display: block; background: #fffbeb; border: 1px solid #fbbf24; padding: 10px; border-radius: 4px; font-weight: 700; color: #92400e; font-size: 18px;">${plainPassword}</code>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          <strong>Important security notice:</strong> This password is auto-generated. Please log in and familiarize yourself with the dashboard. Password changes are not permitted for security reasons.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">ServicePro Business Management Platform — Internal Provisioning</p>
      </div>
    `,
  });

  return info;
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendCredentialsEmail(
  personalEmail: string,
  fullName: string,
  systemEmail: string,
  plainPassword: string,
  role: string,
  isNew = false
) {
  const roleLabel = role === 'super_admin' ? 'Super Admin'
    : role === 'manager' ? 'Manager'
    : 'Receptionist';

  const subject = isNew
    ? 'Your ServicePro credentials have been reset'
    : 'Your ServicePro Login Credentials';

  await transporter.sendMail({
    from: `"ServicePro" <${process.env.MAIL_USER}>`,
    to: personalEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e3a5f; margin-bottom: 4px;">Welcome to ServicePro</h2>
        <p style="color: #6b7280; margin-top: 0;">Hi ${fullName}, your account has been created.</p>

        <div style="background: #f9fafb; border-radius: 6px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Role</p>
          <p style="margin: 0 0 20px; font-weight: 600; color: #111827;">${roleLabel}</p>

          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">System Email (Login ID)</p>
          <p style="margin: 0 0 20px; font-weight: 600; color: #111827;">${systemEmail}</p>

          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Password</p>
          <p style="margin: 0; font-weight: 600; color: #111827; font-family: monospace; font-size: 16px;">${plainPassword}</p>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
          Use these credentials to log in. You cannot change your password —
          contact your administrator if you lose access.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">ServicePro — Company Credential System</p>
      </div>
    `,
  });
}

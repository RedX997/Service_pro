import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize Resend (primary for production)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer (fallback for local)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

export async function sendCredentialsEmail(personalEmail: string, fullName: string, systemEmail: string, plainPassword: string, role: string, isNew = false) {
  const roleLabel = role === 'super_admin' ? 'Super Admin'
    : role === 'manager' ? 'Manager'
    : 'Receptionist';

  const subject = isNew ? `🔐 REGENERATED: New Access for ServicePro` : `🔐 Credentials for your ServicePro Account`;

  const htmlContent = `
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
        <strong>Security notice:</strong> This password is auto-generated. Please log in and familiarize yourself with the dashboard.
      </p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">ServicePro Business Management Platform</p>
    </div>
  `;

  // If Resend is configured, use it (Best for Production/Render)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ServicePro <onboarding@resend.dev>',
        to: personalEmail,
        subject: subject,
        html: htmlContent,
      });
      
      if (error) throw error;
      return { accepted: [personalEmail], messageId: data?.id };
    } catch (err) {
      console.warn('Resend failed, falling back to Gmail SMTP...', err);
    }
  }

  // Fallback to Nodemailer
  const info = await transporter.sendMail({
    from: `"ServicePro Admin" <${process.env.MAIL_USER}>`,
    to: personalEmail,
    subject: subject,
    html: htmlContent,
  });

  return info;
}

import express from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendCredentialsEmail } from '../helpers/mailer.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// Middleware: only cascade_admin can access these routes
async function requireCascadeAdmin(req: any, res: any, next: any) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: { role: true },
  });

  if (!user || user.role.role_name !== 'cascade_admin') {
    return res.status(403).json({ error: 'Forbidden: cascade_admin only' });
  }

  next();
}

// Generate system email from name + role
async function generateSystemEmail(fullName: string, role: string): Promise<string> {
  const slug = fullName.trim().toLowerCase().replace(/\s+/g, '.');
  const roleTag = role.replace('_', '');
  const base = `${slug}.${roleTag}ca@gmail.com`;

  // Check for collision
  const existing = await prisma.user.findUnique({ where: { email: base } });
  if (!existing) return base;

  // Add numeric suffix if collision
  let suffix = 2;
  while (true) {
    const candidate = `${slug}.${roleTag}ca${suffix}@gmail.com`;
    const exists = await prisma.user.findUnique({ where: { email: candidate } });
    if (!exists) return candidate;
    suffix++;
  }
}

// Generate strong random password
function generatePassword(): string {
  return crypto.randomBytes(9).toString('base64'); // 12 chars, mixed
}

// GET /api/cascade-admin/credentials — full credential log (company only)
router.get('/credentials', requireCascadeAdmin, async (req, res) => {
  try {
    const credentials = await prisma.cascadeCredential.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(credentials);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cascade-admin/credentials/:id — update notes or mark inactive
router.patch('/credentials/:id', requireCascadeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const updated = await prisma.cascadeCredential.update({
      where: { id: Number(id) },
      data: { ...(is_active !== undefined && { is_active }) },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cascade-admin/users/:id/sessions — login history for a user
router.get('/users/:id/sessions', requireCascadeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sessions = await prisma.userSession.findMany({
      where: { user_id: Number(id) },
      orderBy: { logged_in_at: 'desc' },
      take: 50,
    });
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cascade-admin/users — list all managed users
router.get('/users', requireCascadeAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          role_name: { in: ['receptionist', 'manager', 'super_admin'] },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        personal_email: true,
        is_active: true,
        last_login_at: true,
        job_title: true,
        created_at: true,
        role: { select: { role_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cascade-admin/users — create user + send credentials
router.post('/users', requireCascadeAdmin, async (req, res) => {
  try {
    const { fullName, personalEmail, role } = req.body;

    if (!fullName || !personalEmail || !role) {
      return res.status(400).json({ error: 'fullName, personalEmail, and role are required' });
    }

    const validRoles = ['receptionist', 'manager', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Find role record
    const roleRecord = await prisma.role.findUnique({ where: { role_name: role } });
    if (!roleRecord) return res.status(400).json({ error: 'Role not found in DB' });

    // Generate credentials
    const systemEmail = await generateSystemEmail(fullName, role);
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    // Save user to users table (for login)
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: systemEmail,
        password: hashedPassword,
        role_id: roleRecord.id,
        personal_email: personalEmail,
        is_active: true,
      },
      include: { role: true },
    });

    // Save to cascade_credentials table (company credential log)
    await prisma.cascadeCredential.create({
      data: {
        full_name: fullName,
        role_name: role,
        system_email: systemEmail,
        personal_email: personalEmail,
        plain_password: plainPassword,
        is_active: true,
      },
    });

    // Send email (non-blocking — don't fail user creation if email fails)
    sendCredentialsEmail(personalEmail, fullName, systemEmail, plainPassword, role)
      .then((info) => {
        console.log(`✅ Credentials emailed to ${personalEmail}`);
        console.log(`📬 Mailer Info: sent to ${info.accepted?.join(', ')} | ID: ${info.messageId}`);
      })
      .catch(err => {
        console.error(`⚠️ Email failed for ${personalEmail}:`, err);
      });

    // Return standardized response for UI display
    res.status(201).json({ 
      success: true,
      fullName, 
      systemEmail, 
      plainPassword,
      userId: newUser.id 
    });
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cascade-admin/users/:id/regenerate — regenerate password
router.patch('/users/:id/regenerate', requireCascadeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.personal_email) return res.status(400).json({ error: 'No personal email on file' });

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword },
    });

    // Update credential log with new password
    await prisma.cascadeCredential.updateMany({
      where: { system_email: user.email },
      data: { plain_password: plainPassword },
    });

    // Send new credentials email (unique subject)
    try {
      await sendCredentialsEmail(user.personal_email, user.name, user.email, plainPassword, user.role.role_name, true);
      console.log(`✅ New credentials emailed to ${user.personal_email}`);
    } catch (err: any) {
      console.error(`⚠️ Email failed for regeneration to ${user.personal_email}:`, err);
    }

    res.json({ 
      success: true, 
      message: 'Password regenerated and emailed successfully', 
      plainPassword, 
      systemEmail: user.email, 
      fullName: user.name 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cascade-admin/users/:id/toggle — activate/deactivate
router.patch('/users/:id/toggle', requireCascadeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { is_active: !user.is_active },
    });

    // Sync is_active in credential log
    await prisma.cascadeCredential.updateMany({
      where: { system_email: user.email },
      data: { is_active: !user.is_active },
    });

    res.json({ id: updated.id, is_active: updated.is_active });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

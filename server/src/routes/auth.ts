import express from 'express'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { prisma } from '../lib/prisma.js'

const AVATARS_DIR = path.resolve(process.cwd(), 'uploads/avatars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(AVATARS_DIR)) {
      fs.mkdirSync(AVATARS_DIR, { recursive: true })
    }
    cb(null, AVATARS_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|jfif|avif|svg/;
    const mimetype = file.mimetype.startsWith('image/');
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
})

const router = express.Router()

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare with bcrypt (falls back to plain comparison for legacy accounts)
    let passwordMatch = false;
    if (user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Block password changes — credentials are company-managed only
router.patch('/change-password', (req, res) => {
  res.status(403).json({ error: 'Password changes are not permitted. Contact your administrator.' })
})
router.post('/change-password', (req, res) => {
  res.status(403).json({ error: 'Password changes are not permitted. Contact your administrator.' })
})

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { role_name: 'asc' }
    })
    res.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

// Get all users with their roles
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { created_at: 'desc' }
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.post('/profile', (req, res, next) => {
  console.log('Incoming profile update request:', req.headers['content-type']);
  next();
}, upload.single('avatar'), async (req, res) => {
  try {
    const { 
      id, name, email, phone, address, city, state, zip, timezone,
      theme, compactView, showWelcome, showQuickActions, highContrast, fontSize,
      job_title, department
    } = req.body;
    
    console.log('Profile update for user ID:', id);
    if (!id) {
      console.warn('Profile update failed: No user ID provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userId = parseInt(id as string);
    if (isNaN(userId)) {
      console.warn('Profile update failed: Invalid user ID', id);
      return res.status(400).json({ error: 'Invalid User ID format' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (theme !== undefined) updateData.theme = theme;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (department !== undefined) updateData.department = department;
    
    if (compactView !== undefined) updateData.compactView = String(compactView) === 'true';
    if (showWelcome !== undefined) updateData.showWelcome = String(showWelcome) === 'true';
    if (showQuickActions !== undefined) updateData.showQuickActions = String(showQuickActions) === 'true';
    if (highContrast !== undefined) updateData.highContrast = String(highContrast) === 'true';
    if (fontSize !== undefined) updateData.fontSize = fontSize;

    if ((req as any).file) {
      updateData.avatar_url = `/uploads/avatars/${(req as any).file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    // Sync avatar to Employee table if exists
    try {
      if (updateData.avatar_url || name) {
        await prisma.employee.updateMany({
          where: { email: userWithoutPassword.email },
          data: {
            ...(updateData.avatar_url && { avatarUrl: updateData.avatar_url }),
            ...(name && { name })
          }
        });
      }
    } catch (e) {
      console.error('Error syncing to employee:', e);
    }
    
    // Add debug info to response
    (userWithoutPassword as any)._debug = {
      fileReceived: !!(req as any).file,
      filename: (req as any).file?.filename,
      bodyFields: Object.keys(req.body)
    };
    
    res.json(userWithoutPassword);
    } catch (error: any) {
    console.error('CRITICAL: Error updating profile:', error);
    
    // Handle unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Email already in use', 
        details: 'The email address you entered is already registered to another user account.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to update profile', 
      details: error.message,
      code: error.code 
    });
  }
});

router.patch('/profile', upload.single('avatar'), async (req, res) => {
  try {
    const { 
      id, name, email, phone, address, city, state, zip, timezone,
      theme, compactView, showWelcome, showQuickActions, highContrast, fontSize,
      job_title, department
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData: any = {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      timezone,
      theme,
      job_title,
      department,
      compactView: compactView === 'true' || compactView === true,
      showWelcome: showWelcome === 'true' || showWelcome === true,
      showQuickActions: showQuickActions === 'true' || showQuickActions === true,
      highContrast: highContrast === 'true' || highContrast === true,
      fontSize
    };

    if ((req as any).file) {
      updateData.avatar_url = `/uploads/avatars/${(req as any).file.filename}`;
    }

    const userIdNum = parseInt(id as string);
    const updatedUser = await prisma.user.update({
      where: { id: isNaN(userIdNum) ? 0 : userIdNum },
      data: updateData,
      include: { role: true }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    // Sync avatar to Employee table if exists
    try {
      if (updateData.avatar_url || name) {
        await prisma.employee.updateMany({
          where: { email: userWithoutPassword.email },
          data: {
            ...(updateData.avatar_url && { avatarUrl: updateData.avatar_url }),
            ...(name && { name })
          }
        });
      }
    } catch (e) {
      console.error('Error syncing to employee:', e);
    }
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user activity logs
router.get('/profile/activity', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = await prisma.clientActivityLog.findMany({
      where: { performedBy: parseInt(userId as string) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        client: {
          select: { name: true }
        }
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get user assigned clients
router.get('/profile/clients', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role']; // Assuming this might be passed or we fetch it
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // This is a bit complex because Employee and User are separate.
    // For now, let's fetch clients where assignedEmployee matches the user's name
    // or just fetch a subset for demo if no direct link exists yet.
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId as string) }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { assignedEmployee: user.name },
          // If super_admin, they might see more, but let's keep it user-specific
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(clients);
  } catch (error) {
    console.error('Error fetching profile clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

export default router

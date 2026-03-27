import express from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'

const router = express.Router()

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    // Find user by email with role information
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check account is active
    if (user.is_active === false) {
      return res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' })
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

    // Record login time and create session
    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || null;
    const now = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: now },
    });

    const session = await prisma.userSession.create({
      data: { user_id: user.id, logged_in_at: now, ip_address: ip },
    });

    // Return user data (excluding password) + sessionId for logout tracking
    const { password: _, ...userWithoutPassword } = user
    res.json({ ...userWithoutPassword, sessionId: session.id })
    
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

// Logout — record session end time and duration
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.json({ message: 'No session to close' });

    const session = await prisma.userSession.findUnique({ where: { id: Number(sessionId) } });
    if (!session || session.logged_out_at) return res.json({ message: 'Session already closed' });

    const now = new Date();
    const durationMs = now.getTime() - new Date(session.logged_in_at).getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    await prisma.userSession.update({
      where: { id: Number(sessionId) },
      data: { logged_out_at: now, duration_minutes: durationMinutes },
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { role: true }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    
    const user = await prisma.user.create({
      data: { name, email, password, role_id },
      include: { role: true }
    })
    
    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role_id } = req.body
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role_id },
      include: { role: true }
    })
    
    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
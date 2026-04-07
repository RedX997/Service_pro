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

export default router

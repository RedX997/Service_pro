import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

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
    
    // In a real app, you would hash and compare passwords
    // For now, we'll do a simple comparison
    // TODO: Implement proper password hashing (bcrypt)
    if (user.password !== password) {
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
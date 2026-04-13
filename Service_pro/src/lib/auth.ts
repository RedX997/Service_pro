import { prisma } from './prisma'
import { Role, User } from '@prisma/client'

export type UserWithRole = User & {
  role: Role
}

// Get user by email with role
export async function getUserByEmail(email: string): Promise<UserWithRole | null> {
  return await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  })
}

// Get user by id with role
export async function getUserById(id: number): Promise<UserWithRole | null> {
  return await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  })
}

// Create new user
export async function createUser(data: {
  name: string
  email: string
  password: string
  role_id: number
}): Promise<User> {
  return await prisma.user.create({
    data
  })
}

// Get all roles
export async function getAllRoles(): Promise<Role[]> {
  return await prisma.role.findMany({
    orderBy: { role_name: 'asc' }
  })
}

// Get users by role
export async function getUsersByRole(roleName: string): Promise<UserWithRole[]> {
  return await prisma.user.findMany({
    where: {
      role: {
        role_name: roleName
      }
    },
    include: { role: true }
  })
}

// Check if user has specific role
export function hasRole(user: UserWithRole, roleName: string): boolean {
  return user.role.role_name === roleName
}

// Check if user is admin
export function isAdmin(user: UserWithRole): boolean {
  return hasRole(user, 'super_admin')
}

// Check if user is manager or admin
export function isManagerOrAdmin(user: UserWithRole): boolean {
  return hasRole(user, 'manager') || isAdmin(user)
}
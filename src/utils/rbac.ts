// Role-Based Access Control (RBAC) System
// Defines role hierarchy and access control functions

export type UserRole = 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin'

// Role hierarchy - defines which roles each user role can access
export const roleHierarchy: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'manager', 'receptionist'],
  manager: ['manager', 'receptionist'],
  receptionist: ['receptionist'],
  cascade_admin: ['cascade_admin'],
}

// Role to dashboard route mapping
export const roleRoutes: Record<UserRole, string> = {
  super_admin: '/dashboard',
  manager: '/dashboard',
  receptionist: '/dashboard',
  cascade_admin: '/cascade-admin',
}

/**
 * Check if a user role can access a required role
 */
export function canAccess(userRole: string, requiredRole: string): boolean {
  if (!roleHierarchy[userRole as UserRole]) return false
  if (requiredRole === 'cascade_admin') return userRole === 'cascade_admin'
  return roleHierarchy[userRole as UserRole].includes(requiredRole as UserRole)
}

/**
 * Get the dashboard route for a user role
 */
export function getDashboardRoute(role: string): string {
  return roleRoutes[role as UserRole] || '/login'
}

/**
 * Validate if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ['super_admin', 'manager', 'receptionist', 'cascade_admin'].includes(role)
}
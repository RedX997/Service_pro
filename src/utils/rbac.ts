// Role-Based Access Control (RBAC) System
// Defines role hierarchy and access control functions

export type UserRole = 'super_admin' | 'manager' | 'receptionist'

// Role hierarchy - defines which roles each user role can access
export const roleHierarchy: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'manager', 'receptionist'],
  manager: ['manager', 'receptionist'],
  receptionist: ['receptionist']
}

// Role to dashboard route mapping
export const roleRoutes: Record<UserRole, string> = {
  super_admin: '/dashboard',
  manager: '/dashboard',
  receptionist: '/dashboard'
}

/**
 * Check if a user role can access a required role
 * @param userRole - The user's current role
 * @param requiredRole - The role required to access a resource
 * @returns true if access is allowed, false otherwise
 */
export function canAccess(userRole: string, requiredRole: string): boolean {
  // Validate that userRole exists in hierarchy
  if (!roleHierarchy[userRole as UserRole]) {
    return false
  }
  
  // Check if requiredRole is in the user's accessible roles
  return roleHierarchy[userRole as UserRole].includes(requiredRole as UserRole)
}

/**
 * Get the dashboard route for a user role
 * @param role - User role
 * @returns Dashboard route path
 */
export function getDashboardRoute(role: string): string {
  return roleRoutes[role as UserRole] || '/login'
}

/**
 * Validate if a role is valid
 * @param role - Role to validate
 * @returns true if role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return ['super_admin', 'manager', 'receptionist'].includes(role)
}
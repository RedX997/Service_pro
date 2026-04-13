import { User } from '../contexts/AuthContext'

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  super_admin: 3,
  manager: 2,
  receptionist: 1
} as const

// Check if user has minimum required role level
export const hasMinimumRole = (
  user: User | null, 
  requiredRole: keyof typeof ROLE_HIERARCHY
): boolean => {
  if (!user) return false
  
  const userLevel = ROLE_HIERARCHY[user.role]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]
  
  return userLevel >= requiredLevel
}

// Check if user can access a specific feature
export const canAccessFeature = (user: User | null, feature: string): boolean => {
  if (!user) return false

  const permissions = {
    // Admin permissions
    user_management: ['super_admin'],
    system_settings: ['super_admin'],
    database_access: ['super_admin'],
    
    // Manager permissions
    employee_management: ['super_admin', 'manager'],
    reports: ['super_admin', 'manager'],
    client_management: ['super_admin', 'manager'],
    
    // Receptionist permissions
    visitor_checkin: ['super_admin', 'manager', 'receptionist'],
    basic_client_info: ['super_admin', 'manager', 'receptionist'],
    appointments: ['super_admin', 'manager', 'receptionist']
  }

  const allowedRoles = permissions[feature as keyof typeof permissions]
  return allowedRoles ? allowedRoles.includes(user.role) : false
}

// Get user display name with role
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest'
  
  const roleNames = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    receptionist: 'Receptionist'
  }
  
  return `${user.name} (${roleNames[user.role]})`
}

// Format role name for display
export const formatRoleName = (role: string | undefined): string => {
  if (!role) return 'No role'
  
  const roleNames: Record<string, string> = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    receptionist: 'Receptionist'
  }
  
  return roleNames[role] || role.replace('_', ' ')
}

// Validate user object structure
export const isValidUser = (user: any): user is User => {
  return (
    user &&
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    ['super_admin', 'manager', 'receptionist', 'employee'].includes(user.role)
  )
}

// Get full avatar URL
export const getAvatarUrl = (url: string | null | undefined) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBaseUrl}${cleanUrl}`;
};
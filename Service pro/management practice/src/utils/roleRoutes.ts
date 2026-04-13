// Role-based route mapping utility
// Provides safe navigation based on user roles

export type UserRole = 'super_admin' | 'manager' | 'receptionist'

// Role to route mapping
export const roleRoutes: Record<UserRole, string> = {
  super_admin: '/admin-dashboard',
  manager: '/manager-dashboard',
  receptionist: '/reception-dashboard'
} as const

// Default fallback route for unknown roles or unauthenticated users
export const DEFAULT_ROUTE = '/dashboard'

// Get dashboard route based on user role
export const getDashboardRoute = (role: string): string => {
  // Type guard to ensure role is valid
  if (isValidRole(role)) {
    return roleRoutes[role]
  }
  
  // Fallback for unknown roles
  console.warn(`Unknown role: ${role}. Redirecting to default route.`)
  return DEFAULT_ROUTE
}

// Type guard to check if role is valid
export const isValidRole = (role: string): role is UserRole => {
  return role in roleRoutes
}

// Get all available routes for roles
export const getAllRoleRoutes = (): Record<UserRole, string> => {
  return { ...roleRoutes }
}

// Get route by role with null safety
export const getRouteByRole = (role: UserRole | null | undefined): string => {
  if (!role) {
    return DEFAULT_ROUTE
  }
  
  return roleRoutes[role] || DEFAULT_ROUTE
}

// Check if a route belongs to a specific role
export const isRoleRoute = (route: string, role: UserRole): boolean => {
  return roleRoutes[role] === route
}

// Get role by route (reverse lookup)
export const getRoleByRoute = (route: string): UserRole | null => {
  const entries = Object.entries(roleRoutes) as [UserRole, string][]
  const found = entries.find(([, routePath]) => routePath === route)
  return found ? found[0] : null
}
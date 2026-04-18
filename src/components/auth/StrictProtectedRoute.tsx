import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { canAccess } from '../../utils/rbac'

interface ProtectedRouteProps {
  requiredRole: string
  children: ReactNode
}

/**
 * Strict Protected Route Component
 * Enforces role-based access control using hierarchy system
 * BLOCKS manual URL access if user doesn't have permission
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRole, 
  children 
}) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // If no user → redirect to appropriate login
  if (!isAuthenticated || !user) {
    console.warn(`🔐 Unauthorized access blocked: Attempted to reach ${location.pathname} without authentication.`);
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Use canAccess function with role hierarchy
  if (!canAccess(user.role, requiredRole)) {
    // If false → redirect to "/unauthorized"
    return <Navigate to="/unauthorized" replace />
  }

  // If true → render children
  return <>{children}</>
}

export default ProtectedRoute
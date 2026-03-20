import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  children 
}) => {
  const { user } = useAuth()
  const location = useLocation()

  // 1. If no user → redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. If user.role === "super_admin" → allow access to ALL routes
  if (user.role === 'super_admin') {
    return <>{children}</>
  }

  // 3. If user.role NOT in allowedRoles → redirect to /unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Else → render children
  return <>{children}</>
}

// Convenience components for common role combinations
export const AdminOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin']}>
    {children}
  </ProtectedRoute>
)

export const ManagerAndAbove: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['manager']}>
    {children}
  </ProtectedRoute>
)

export const AllRoles: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['manager', 'receptionist']}>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute
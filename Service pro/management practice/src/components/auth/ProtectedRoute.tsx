import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRoleNavigation } from '../../hooks/useRoleNavigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: ('super_admin' | 'manager' | 'receptionist')[]
  redirectToRoleDashboard?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  redirectToRoleDashboard = false
}) => {
  const { user, isAuthenticated } = useAuth()
  const { isOnCorrectDashboard } = useRoleNavigation()
  const location = useLocation()

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role permissions if required roles are specified
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">🚫</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Required roles: {requiredRoles.join(', ')}
              <br />
              Your role: {user.role}
            </p>
            <Navigate to="/login" replace />
          </div>
        </div>
      </div>
    )
  }

  // Redirect to correct dashboard if user is on wrong dashboard
  if (redirectToRoleDashboard && !isOnCorrectDashboard(location.pathname)) {
    const { navigateToRoleDashboard } = useRoleNavigation()
    useEffect(() => {
      navigateToRoleDashboard()
    }, [])
    return null
  }

  return <>{children}</>
}

// Convenience components for specific role protection
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin']}>
    {children}
  </ProtectedRoute>
)

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin', 'manager']}>
    {children}
  </ProtectedRoute>
)

export const ReceptionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin', 'manager', 'receptionist']}>
    {children}
  </ProtectedRoute>
)
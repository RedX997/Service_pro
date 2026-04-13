import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRoleNavigation } from '../../hooks/useRoleNavigation'

interface LoginRedirectProps {
  children: React.ReactNode
}

// Component that redirects authenticated users to their dashboard
export const LoginRedirect: React.FC<LoginRedirectProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { navigateToRoleDashboard } = useRoleNavigation()

  useEffect(() => {
    if (isAuthenticated) {
      navigateToRoleDashboard()
    }
  }, [isAuthenticated, navigateToRoleDashboard])

  // Show login form only if not authenticated
  if (isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
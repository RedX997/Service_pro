import React, { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ('super_admin' | 'manager' | 'receptionist')[]
  fallback?: ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = <div>Access denied. Insufficient permissions.</div> 
}) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <div>Please log in to access this content.</div>
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for specific roles
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={['super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const ManagerAndAdmin: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={['super_admin', 'manager']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const AllRoles: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={['super_admin', 'manager', 'receptionist']} fallback={fallback}>
    {children}
  </RoleGuard>
)
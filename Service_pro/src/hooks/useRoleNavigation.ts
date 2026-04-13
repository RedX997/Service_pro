import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardRoute, getRouteByRole } from '../utils/roleRoutes'

// Custom hook for role-based navigation
export const useRoleNavigation = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Navigate to user's role-specific dashboard
  const navigateToRoleDashboard = () => {
    if (user?.role) {
      const route = getDashboardRoute(user.role)
      navigate(route)
    } else {
      navigate('/login')
    }
  }

  // Navigate to a specific role's dashboard (with permission check)
  const navigateToSpecificDashboard = (targetRole: string) => {
    const route = getDashboardRoute(targetRole)
    navigate(route)
  }

  // Get current user's dashboard route
  const getCurrentDashboardRoute = (): string => {
    return getRouteByRole(user?.role)
  }

  // Check if current route matches user's role
  const isOnCorrectDashboard = (currentPath: string): boolean => {
    if (!user?.role) return false
    const expectedRoute = getDashboardRoute(user.role)
    return currentPath === expectedRoute
  }

  return {
    navigateToRoleDashboard,
    navigateToSpecificDashboard,
    getCurrentDashboardRoute,
    isOnCorrectDashboard
  }
}
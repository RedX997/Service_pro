import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User type definition
export interface User {
  id: number
  name: string
  role: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin'
  originalRole?: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin'
  sessionId?: number
}

// Auth context type
interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  switchRole: (role: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin') => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local storage key
const AUTH_STORAGE_KEY = 'servicepro_auth_user'

// Auth provider component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User
          // Validate user structure
          if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.role) {
            setUser(parsedUser)
          } else {
            // Clear invalid data
            localStorage.removeItem(AUTH_STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        // Clear invalid data
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  // Login function
  const login = (userData: User) => {
    try {
      // Validate user data
      if (!userData || !userData.id || !userData.name || !userData.role) {
        throw new Error('Invalid user data')
      }
      
      // Set originalRole to track the login role
      const userWithOriginalRole: User = {
        ...userData,
        originalRole: userData.originalRole || userData.role // Preserve originalRole if it exists
      }
      
      setUser(userWithOriginalRole)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithOriginalRole))
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    // Record session end on the server (fire-and-forget)
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.sessionId) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
          fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: parsedUser.sessionId }),
          }).catch(() => {});
        }
      } catch {}
    }
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  // Switch role function - allows super admin and manager to view different dashboards
  const switchRole = (newRole: 'super_admin' | 'manager' | 'receptionist') => {
    if (!user) return
    
    // Use originalRole to determine permissions (not current role)
    const loginRole = user.originalRole || user.role
    
    // Super admin can switch to any role
    if (loginRole === 'super_admin') {
      const updatedUser: User = {
        ...user,
        role: newRole,
        originalRole: loginRole // Keep original role
      }
      setUser(updatedUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      return
    }
    
    // Manager can only switch between manager and receptionist
    if (loginRole === 'manager') {
      if (newRole === 'super_admin') {
        console.warn('Manager cannot switch to super admin role')
        return
      }
      const updatedUser: User = {
        ...user,
        role: newRole,
        originalRole: loginRole // Keep original role
      }
      setUser(updatedUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      return
    }
    
    // Receptionist cannot switch roles
    console.warn('Receptionist cannot switch roles')
  }

  // Helper functions
  const isAuthenticated = user !== null

  // Context value
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    switchRole
  }

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Export context for advanced usage
export { AuthContext }
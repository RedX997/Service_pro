import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User type definition
export interface User {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin' | 'employee'
  originalRole?: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin' | 'employee'
  sessionId?: number
  phone?: string
  address?: string
  avatar_url?: string
  city?: string
  state?: string
  zip?: string
  timezone?: string
  theme?: string
  compactView?: boolean
  showWelcome?: boolean
  showQuickActions?: boolean
  highContrast?: boolean
  fontSize?: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
  isAuthenticated: boolean
  isLoading: boolean
  switchRole: (role: 'super_admin' | 'manager' | 'receptionist' | 'cascade_admin' | 'employee') => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Session storage key
const AUTH_STORAGE_KEY = 'servicepro_auth_user'

// Auth provider component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from sessionStorage on app start
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY)
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
    const normalizedUserData = { ...userData };
    if (normalizedUserData.role && typeof normalizedUserData.role === 'object' && (normalizedUserData.role as any).role_name) {
      normalizedUserData.role = (normalizedUserData.role as any).role_name;
    }

    const userWithOriginalRole: User = {
      ...normalizedUserData as any,
      originalRole: normalizedUserData.originalRole || normalizedUserData.role // Preserve originalRole if it exists
    }
      
      setUser(userWithOriginalRole)
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithOriginalRole))
    } catch (error) {
      console.error('Error saving user to sessionStorage:', error)
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
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_STORAGE_KEY) // Also clear legacy storage
  }

  // Switch role function - allows super admin and manager to view different dashboards
  const switchRole = (newRole: 'super_admin' | 'manager' | 'receptionist' | 'employee') => {
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
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
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
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      return
    }
    
    // Receptionist cannot switch roles
    console.warn('Receptionist cannot switch roles')
  }

  // Update user info
  const updateUser = (data: any) => {
    if (!user) return
    
    // Normalize role if it's an object from the database
    const normalizedData = { ...data };
    if (normalizedData.role && typeof normalizedData.role === 'object' && normalizedData.role.role_name) {
      normalizedData.role = normalizedData.role.role_name;
    }
    
    const updatedUser = { ...user, ...normalizedData }
    setUser(updatedUser)
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
  }

  // Helper functions
  const isAuthenticated = user !== null

  // Context value
  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isLoading,
    switchRole
  }

  // Apply global appearance settings securely
  useEffect(() => {
    if (!user) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');

    // Theme logic
    const theme = user.theme || localStorage.getItem('theme') || 'light';
    const applyTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    root.classList.add(applyTheme);

    // High Contrast logic
    const isHighContrast = user.highContrast ?? JSON.parse(localStorage.getItem('highContrast') || 'false');
    if (isHighContrast) root.classList.add('high-contrast');

    // Font size logic
    const fontSize = user.fontSize || localStorage.getItem('fontSize') || 'Medium';
    switch(fontSize) {
      case 'Small': root.style.fontSize = '14px'; break;
      case 'Medium': root.style.fontSize = '16px'; break;
      case 'Large': root.style.fontSize = '18px'; break;
      case 'Extra Large': root.style.fontSize = '20px'; break;
      default: root.style.fontSize = '16px';
    }
  }, [user]);

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
import { NavigateFunction } from 'react-router-dom'
import { User } from '../contexts/AuthContext'
import { getDashboardRoute, isValidRole } from './rbac'

// Login result types
export type LoginResult = 
  | { success: true; user: User }
  | { success: false; error: string }

// Login handler configuration
interface LoginHandlerConfig {
  login: (user: User) => void
  navigate: NavigateFunction
  onError?: (error: string) => void
}

// Validate user object structure
const isValidUser = (user: any): user is User => {
  return (
    user &&
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    isValidRole(user.role)
  )
}

// Clean login handler - no if-else chains
export const handleSuccessfulLogin = (
  user: User, 
  { login, navigate, onError }: LoginHandlerConfig
): void => {
  try {
    // Validate user object structure
    if (!isValidUser(user)) {
      const error = 'Invalid user data received'
      onError?.(error)
      navigate('/login')
      return
    }

    // Store user in context
    login(user)

    // Redirect based on role using mapping (NO if-else chains)
    const dashboardRoute = getDashboardRoute(user.role)
    navigate(dashboardRoute, { replace: true })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    onError?.(errorMessage)
    navigate('/login')
  }
}

// API login function - connects to real database
export const performLogin = async (
  email: string, 
  password: string
): Promise<LoginResult> => {
  try {
    // Get API URL from environment variable or fallback to production URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.PROD ? 'https://servicepro-backend.onrender.com/api' : 'http://localhost:3000/api');
    
    console.log('🔐 Login attempt with API URL:', API_BASE_URL);
    
    // Call the actual API endpoint
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { 
        success: false, 
        error: errorData.error || 'Login failed' 
      }
    }

    const userData = await response.json()
    
    // Validate the response structure
    if (!userData || !userData.id || !userData.name || !userData.role) {
      return { 
        success: false, 
        error: 'Invalid response from server' 
      }
    }

    // Convert database user to our User type
    const user: User = {
      id: userData.id,
      name: userData.name,
      role: userData.role.role_name // Database returns role object with role_name
    }

    return { success: true, user }

  } catch (error) {
    console.error('Login error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    }
  }
}

// Complete login flow
export const executeLoginFlow = async (
  email: string,
  password: string,
  config: LoginHandlerConfig
): Promise<void> => {
  const result = await performLogin(email, password)
  
  if (result.success) {
    handleSuccessfulLogin(result.user, config)
  } else {
    config.onError?.(result.error)
  }
}
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardRoute } from '../utils/rbac'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleGoToDashboard = () => {
    if (user) {
      const dashboardRoute = getDashboardRoute(user.role)
      navigate(dashboardRoute)
    } else {
      navigate('/login')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          
          {user && (
            <div className="bg-gray-50 rounded-md p-3 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Current Role:</strong> {user.role}
              </p>
              <p className="text-sm text-gray-700">
                <strong>User:</strong> {user.name}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
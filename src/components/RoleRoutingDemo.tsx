import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRoleNavigation } from '../hooks/useRoleNavigation'
import { 
  roleRoutes, 
  getDashboardRoute, 
  getAllRoleRoutes, 
  isValidRole,
  getRoleByRoute 
} from '../utils/roleRoutes'

export const RoleRoutingDemo: React.FC = () => {
  const { user } = useAuth()
  const { 
    navigateToRoleDashboard, 
    navigateToSpecificDashboard, 
    getCurrentDashboardRoute 
  } = useRoleNavigation()

  const allRoutes = getAllRoleRoutes()
  const currentRoute = getCurrentDashboardRoute()

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">🗺️ Role Routing Demo</h3>
      
      {/* Current User Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Current User</h4>
        <p><strong>Role:</strong> {user?.role || 'Not logged in'}</p>
        <p><strong>Expected Route:</strong> {currentRoute}</p>
        <p><strong>Valid Role:</strong> {user?.role ? isValidRole(user.role) ? '✅' : '❌' : 'N/A'}</p>
      </div>

      {/* Navigation Buttons */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Navigation Actions</h4>
        <div className="space-y-2">
          <button
            onClick={navigateToRoleDashboard}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to My Dashboard
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigateToSpecificDashboard('super_admin')}
              className="bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 text-sm"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => navigateToSpecificDashboard('manager')}
              className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm"
            >
              Manager Dashboard
            </button>
            <button
              onClick={() => navigateToSpecificDashboard('receptionist')}
              className="bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 text-sm"
            >
              Reception Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Route Mapping Display */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Role → Route Mapping</h4>
        <div className="space-y-2">
          {Object.entries(allRoutes).map(([role, route]) => (
            <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-sm">{role}</span>
              <span className="text-blue-600 font-mono text-sm">{route}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Utility Functions Demo */}
      <div>
        <h4 className="font-medium mb-3">Utility Functions</h4>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <strong>getDashboardRoute('manager'):</strong> 
            <span className="ml-2 text-blue-600">{getDashboardRoute('manager')}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>getDashboardRoute('invalid_role'):</strong> 
            <span className="ml-2 text-blue-600">{getDashboardRoute('invalid_role')}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>getRoleByRoute('/admin-dashboard'):</strong> 
            <span className="ml-2 text-blue-600">{getRoleByRoute('/admin-dashboard') || 'null'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
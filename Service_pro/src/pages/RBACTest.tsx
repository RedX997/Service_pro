import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { canAccess, roleHierarchy } from '../utils/rbac'

const RBACTest: React.FC = () => {
  const { user, login, logout } = useAuth()

  // Test users for each role
  const testUsers = {
    super_admin: { id: 1, name: 'Super Admin', role: 'super_admin' as const },
    manager: { id: 2, name: 'Manager', role: 'manager' as const },
    receptionist: { id: 3, name: 'Receptionist', role: 'receptionist' as const }
  }

  const switchToRole = (role: 'super_admin' | 'manager' | 'receptionist') => {
    login(testUsers[role])
  }

  const testAccess = (userRole: string, requiredRole: string) => {
    return canAccess(userRole, requiredRole)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔒 RBAC System Test</h1>
        
        {/* Current User */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Not logged in</p>
          )}
        </div>

        {/* Role Switcher */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Switch Role (Test)</h2>
          <div className="flex gap-3">
            <button
              onClick={() => switchToRole('super_admin')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Super Admin
            </button>
            <button
              onClick={() => switchToRole('manager')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manager
            </button>
            <button
              onClick={() => switchToRole('receptionist')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Receptionist
            </button>
          </div>
        </div>

        {/* Role Hierarchy Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Role Hierarchy</h2>
          <div className="space-y-3">
            {Object.entries(roleHierarchy).map(([role, allowedRoles]) => (
              <div key={role} className="p-3 bg-gray-50 rounded">
                <strong className="capitalize">{role.replace('_', ' ')}:</strong>
                <span className="ml-2">Can access → {allowedRoles.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Access Test Matrix */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Access Test Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">User Role</th>
                  <th className="border border-gray-300 p-3 text-center">Admin Dashboard</th>
                  <th className="border border-gray-300 p-3 text-center">Manager Dashboard</th>
                  <th className="border border-gray-300 p-3 text-center">Reception Dashboard</th>
                </tr>
              </thead>
              <tbody>
                {['super_admin', 'manager', 'receptionist'].map(userRole => (
                  <tr key={userRole}>
                    <td className="border border-gray-300 p-3 font-medium capitalize">
                      {userRole.replace('_', ' ')}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {testAccess(userRole, 'super_admin') ? (
                        <span className="text-green-600 font-bold">✅ ALLOW</span>
                      ) : (
                        <span className="text-red-600 font-bold">❌ DENY</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {testAccess(userRole, 'manager') ? (
                        <span className="text-green-600 font-bold">✅ ALLOW</span>
                      ) : (
                        <span className="text-red-600 font-bold">❌ DENY</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {testAccess(userRole, 'receptionist') ? (
                        <span className="text-green-600 font-bold">✅ ALLOW</span>
                      ) : (
                        <span className="text-red-600 font-bold">❌ DENY</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual URL Test Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Manual URL Access Test</h2>
          <p className="text-gray-600 mb-4">
            Try accessing these URLs directly to test protection:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <a 
                href="/dashboard" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /dashboard
              </a>
              <span className="text-sm text-gray-500">
                (Shows role-specific content - all roles can access)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/admin-dashboard" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /admin-dashboard
              </a>
              <span className="text-sm text-gray-500">
                (Should only work for super_admin)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/manager-dashboard" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /manager-dashboard
              </a>
              <span className="text-sm text-gray-500">
                (Should work for super_admin + manager)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/reception-dashboard" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /reception-dashboard
              </a>
              <span className="text-sm text-gray-500">
                (Should work for all roles)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/settings" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /settings
              </a>
              <span className="text-sm text-gray-500">
                (Should only work for super_admin)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/employees" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /employees
              </a>
              <span className="text-sm text-gray-500">
                (Should work for super_admin + manager)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RBACTest
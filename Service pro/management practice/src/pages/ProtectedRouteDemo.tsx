import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute, AdminOnly, ManagerAndAbove, AllRoles } from '../components/auth/ProtectedRouteNew'

const ProtectedRouteDemo: React.FC = () => {
  const { user, switchRole } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Protected Route Demo</h1>
        
        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {user?.name || 'Not logged in'}</p>
              <p><strong>Role:</strong> {user?.role || 'No role'}</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Switch Role (Demo):</p>
              <div className="flex gap-2">
                <button
                  onClick={() => switchRole('super_admin')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Admin
                </button>
                <button
                  onClick={() => switchRole('manager')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Manager
                </button>
                <button
                  onClick={() => switchRole('receptionist')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Protected Content Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Admin Only */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Admin Only Content</h3>
            <AdminOnly>
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">🔒 This content is only visible to super_admin users.</p>
                <p className="text-red-700 text-sm mt-2">
                  Super admins have access to ALL routes regardless of allowedRoles.
                </p>
              </div>
            </AdminOnly>
          </div>

          {/* Manager and Above */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Manager Level</h3>
            <ManagerAndAbove>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">👔 This content is for managers.</p>
                <p className="text-blue-700 text-sm mt-2">
                  Allowed roles: ['manager'] + super_admin (always allowed)
                </p>
              </div>
            </ManagerAndAbove>
          </div>

          {/* All Roles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600">All Staff</h3>
            <AllRoles>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">👥 This content is for all staff.</p>
                <p className="text-green-700 text-sm mt-2">
                  Allowed roles: ['manager', 'receptionist'] + super_admin
                </p>
              </div>
            </AllRoles>
          </div>

          {/* Custom Protected Route */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">Custom Protection</h3>
            <ProtectedRoute allowedRoles={['receptionist']}>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                <p className="text-purple-800">📞 Receptionist only content.</p>
                <p className="text-purple-700 text-sm mt-2">
                  Custom allowedRoles: ['receptionist'] + super_admin
                </p>
              </div>
            </ProtectedRoute>
          </div>
        </div>

        {/* Logic Explanation */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Protection Logic</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>1. No user:</strong> → Redirect to /login
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>2. user.role === "super_admin":</strong> → Allow access to ALL routes
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>3. user.role NOT in allowedRoles:</strong> → Redirect to /unauthorized
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>4. Else:</strong> → Render children
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRouteDemo
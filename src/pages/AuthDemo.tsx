import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginForm } from '../components/auth/LoginForm'
import { UserProfile } from '../components/auth/UserProfile'
import { RoleGuard, AdminOnly, ManagerAndAdmin } from '../components/auth/RoleGuard'
import { RoleRoutingDemo } from '../components/RoleRoutingDemo'

const AuthDemo: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Authentication Demo</h1>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome, {user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile */}
          <UserProfile />

          {/* Role Routing Demo */}
          <RoleRoutingDemo />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role-based Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Role-Based Access Demo</h3>
            
            <div className="space-y-4">
              {/* Admin Only Content */}
              <AdminOnly fallback={<div className="text-gray-500 italic">Admin content hidden</div>}>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-medium text-red-800">🔒 Admin Only</h4>
                  <p className="text-red-700 text-sm">This content is only visible to super admins.</p>
                </div>
              </AdminOnly>

              {/* Manager and Admin Content */}
              <ManagerAndAdmin fallback={<div className="text-gray-500 italic">Manager content hidden</div>}>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800">👔 Manager & Admin</h4>
                  <p className="text-blue-700 text-sm">This content is visible to managers and admins.</p>
                </div>
              </ManagerAndAdmin>

              {/* All Roles Content */}
              <RoleGuard allowedRoles={['super_admin', 'manager', 'receptionist']}>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-800">👥 All Roles</h4>
                  <p className="text-green-700 text-sm">This content is visible to all authenticated users.</p>
                </div>
              </RoleGuard>

              {/* Custom Role Check */}
              <RoleGuard 
                allowedRoles={['receptionist']} 
                fallback={<div className="text-gray-500 italic">Receptionist content hidden</div>}
              >
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800">📞 Receptionist Only</h4>
                  <p className="text-yellow-700 text-sm">This content is only visible to receptionists.</p>
                </div>
              </RoleGuard>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Demo */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Demo: Switch Roles</h3>
          <p className="text-gray-600 mb-4">Click to test different role permissions:</p>
          <DemoRoleSwitcher />
        </div>
      </div>
    </div>
  )
}

const DemoRoleSwitcher: React.FC = () => {
  const { login, user } = useAuth()

  const switchRole = (role: 'super_admin' | 'manager' | 'receptionist') => {
    if (user) {
      login({
        ...user,
        role
      })
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => switchRole('super_admin')}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Switch to Admin
      </button>
      <button
        onClick={() => switchRole('manager')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Switch to Manager
      </button>
      <button
        onClick={() => switchRole('receptionist')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Switch to Receptionist
      </button>
    </div>
  )
}

export default AuthDemo
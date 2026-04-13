import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const UserProfile: React.FC = () => {
  const { user, logout, isAdmin, isManager, isReceptionist } = useAuth()

  if (!user) {
    return null
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'receptionist':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'manager':
        return 'Manager'
      case 'receptionist':
        return 'Receptionist'
      default:
        return role
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">User Profile</h3>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{user.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Permissions</label>
          <div className="mt-1 space-y-1">
            {isAdmin && (
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Full system access
              </div>
            )}
            {isManager && (
              <div className="flex items-center text-sm text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Management access
              </div>
            )}
            {isReceptionist && (
              <div className="flex items-center text-sm text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Reception access
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
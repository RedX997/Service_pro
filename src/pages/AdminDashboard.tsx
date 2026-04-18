import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AdminOnly } from '../components/auth/RoleGuard'

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">System Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage system settings, configurations, and security.</p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                Access System Settings
              </button>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Create, edit, and manage user accounts and roles.</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Manage Users
              </button>
            </div>

            {/* Database Access */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🗄️</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Database Access</h3>
              </div>
              <p className="text-gray-600 mb-4">Direct database access and advanced queries.</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Access Database
              </button>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Advanced Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">Comprehensive system analytics and reporting.</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                View Analytics
              </button>
            </div>

            {/* Security Logs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Security Logs</h3>
              </div>
              <p className="text-gray-600 mb-4">Monitor security events and access logs.</p>
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
                View Security Logs
              </button>
            </div>

            {/* Backup & Recovery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">💾</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Backup & Recovery</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage system backups and recovery options.</p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
                Manage Backups
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}

export default AdminDashboard
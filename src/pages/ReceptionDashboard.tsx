import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AllRoles } from '../components/auth/RoleGuard'

const ReceptionDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <AllRoles>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Visitor Check-in */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">👋</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Visitor Check-in</h3>
              </div>
              <p className="text-gray-600 mb-4">Register new visitors and manage check-ins.</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Check-in Visitor
              </button>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📅</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Appointments</h3>
              </div>
              <p className="text-gray-600 mb-4">Schedule and manage client appointments.</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Manage Appointments
              </button>
            </div>

            {/* Client Directory */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Client Directory</h3>
              </div>
              <p className="text-gray-600 mb-4">Access basic client information and contacts.</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                View Clients
              </button>
            </div>

            {/* Phone Directory */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">📞</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Phone Directory</h3>
              </div>
              <p className="text-gray-600 mb-4">Employee and department contact information.</p>
              <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
                View Directory
              </button>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Messages</h3>
              </div>
              <p className="text-gray-600 mb-4">Handle incoming messages and communications.</p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                View Messages
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Quick Actions</h3>
              </div>
              <p className="text-gray-600 mb-4">Frequently used reception tasks and shortcuts.</p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>
    </AllRoles>
  )
}

export default ReceptionDashboard
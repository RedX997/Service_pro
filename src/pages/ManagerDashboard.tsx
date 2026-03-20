import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ManagerAndAdmin } from '../components/auth/RoleGuard'

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <ManagerAndAdmin>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employee Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👨‍💼</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Employee Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage employee schedules, performance, and assignments.</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Manage Employees
              </button>
            </div>

            {/* Client Relations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Client Relations</h3>
              </div>
              <p className="text-gray-600 mb-4">Oversee client relationships and service delivery.</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                View Clients
              </button>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Reports & Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">View performance reports and business analytics.</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                View Reports
              </button>
            </div>

            {/* Department Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">🏢</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Department Overview</h3>
              </div>
              <p className="text-gray-600 mb-4">Monitor department performance and resources.</p>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
                View Departments
              </button>
            </div>

            {/* Task Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">✅</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Task Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Assign and track tasks across teams.</p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                Manage Tasks
              </button>
            </div>

            {/* Time Tracking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-xl">⏰</span>
                </div>
                <h3 className="text-lg font-semibold ml-3">Time Tracking</h3>
              </div>
              <p className="text-gray-600 mb-4">Monitor employee time and project hours.</p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
                View Time Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </ManagerAndAdmin>
  )
}

export default ManagerDashboard
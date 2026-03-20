// ProtectedRoute Usage Examples
// Import the component and use it in your routes

import React from 'react'
import { ProtectedRoute, AdminOnly, ManagerAndAbove, AllRoles } from './ProtectedRouteNew'

// Example 1: Basic Usage with allowedRoles
const ExampleBasicUsage = () => (
  <ProtectedRoute allowedRoles={['manager', 'receptionist']}>
    <div>This content is only for managers and receptionists</div>
  </ProtectedRoute>
)

// Example 2: Admin Only (super_admin always has access)
const ExampleAdminOnly = () => (
  <ProtectedRoute allowedRoles={['super_admin']}>
    <div>Admin panel content</div>
  </ProtectedRoute>
)

// Example 3: Using convenience components
const ExampleConvenienceComponents = () => (
  <div>
    <AdminOnly>
      <div>Only super_admin can see this</div>
    </AdminOnly>
    
    <ManagerAndAbove>
      <div>Managers can see this (+ super_admin always allowed)</div>
    </ManagerAndAbove>
    
    <AllRoles>
      <div>All staff can see this (+ super_admin always allowed)</div>
    </AllRoles>
  </div>
)

// Example 4: In React Router Routes
const ExampleInRoutes = () => (
  <>
    {/* Route accessible by managers and receptionists */}
    <Route 
      path="/staff-area" 
      element={
        <ProtectedRoute allowedRoles={['manager', 'receptionist']}>
          <StaffArea />
        </ProtectedRoute>
      } 
    />
    
    {/* Route accessible only by super_admin */}
    <Route 
      path="/admin-panel" 
      element={
        <AdminOnly>
          <AdminPanel />
        </AdminOnly>
      } 
    />
    
    {/* Route accessible by managers (+ super_admin automatically) */}
    <Route 
      path="/management" 
      element={
        <ProtectedRoute allowedRoles={['manager']}>
          <ManagementDashboard />
        </ProtectedRoute>
      } 
    />
  </>
)

// Example 5: Custom role combinations
const ExampleCustomRoles = () => (
  <div>
    {/* Only receptionists */}
    <ProtectedRoute allowedRoles={['receptionist']}>
      <div>Reception desk tools</div>
    </ProtectedRoute>
    
    {/* Multiple specific roles */}
    <ProtectedRoute allowedRoles={['manager', 'supervisor', 'team_lead']}>
      <div>Leadership content</div>
    </ProtectedRoute>
    
    {/* Single role */}
    <ProtectedRoute allowedRoles={['hr_manager']}>
      <div>HR specific content</div>
    </ProtectedRoute>
  </div>
)

// Example 6: Nested protection
const ExampleNestedProtection = () => (
  <ProtectedRoute allowedRoles={['manager', 'receptionist']}>
    <div>
      <h1>Staff Area</h1>
      
      {/* Further nested protection */}
      <AdminOnly>
        <div>Admin settings within staff area</div>
      </AdminOnly>
      
      <ProtectedRoute allowedRoles={['manager']}>
        <div>Manager tools within staff area</div>
      </ProtectedRoute>
    </div>
  </ProtectedRoute>
)

// Mock components for examples
const StaffArea = () => <div>Staff Area Component</div>
const AdminPanel = () => <div>Admin Panel Component</div>
const ManagementDashboard = () => <div>Management Dashboard Component</div>

export {
  ExampleBasicUsage,
  ExampleAdminOnly,
  ExampleConvenienceComponents,
  ExampleInRoutes,
  ExampleCustomRoles,
  ExampleNestedProtection
}
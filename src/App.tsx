import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/StrictProtectedRoute";
import "@/lib/debug"; // Import debug utilities
import DiagnosticTest from "./pages/DiagnosticTest";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import Clients from "./pages/Clients";
import Messages from "./pages/Messages";
import TimeTracking from "./pages/TimeTracking";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Appointments from "./pages/Appointments";
import AuthDemo from "./pages/AuthDemo";
import ProtectedRouteDemo from "./pages/ProtectedRouteDemo";
import RBACTest from "./pages/RBACTest";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/diagnostic" element={<DiagnosticTest />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/auth-demo" element={<AuthDemo />} />
      <Route path="/protected-demo" element={<ProtectedRouteDemo />} />
      <Route path="/rbac-test" element={<RBACTest />} />
      
      {/* MAIN DASHBOARD - Role-based content inside */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Keep separate dashboard routes for direct access (optional) */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requiredRole="super_admin">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute requiredRole="manager">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reception-dashboard" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Other protected routes */}
      <Route 
        path="/visitors" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Visitors />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clients" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Clients />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Messages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/time-tracking" 
        element={
          <ProtectedRoute requiredRole="manager">
            <TimeTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute requiredRole="manager">
            <Employees />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/departments" 
        element={
          <ProtectedRoute requiredRole="manager">
            <Departments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute requiredRole="super_admin">
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute requiredRole="manager">
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute requiredRole="receptionist">
            <Appointments />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

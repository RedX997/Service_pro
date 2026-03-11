import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get employee ID from environment variable (different for local vs production)
const DEMO_EMPLOYEE_ID = import.meta.env.VITE_DEMO_EMPLOYEE_ID || '26830838-63af-4dab-b352-ef9181944550';

// Debug: Log the employee ID being used
console.log('🔍 DEMO_EMPLOYEE_ID:', DEMO_EMPLOYEE_ID);
console.log('🔍 Environment:', import.meta.env.MODE);
console.log('🔍 All env vars:', import.meta.env);

// Demo users for different roles - using environment-specific employee IDs
const demoUsers: Record<UserRole, User> = {
  super_admin: {
    id: DEMO_EMPLOYEE_ID,
    name: 'Admin User',
    email: 'admin@servicepro.com',
    role: 'super_admin',
    avatar: undefined,
  },
  manager: {
    id: DEMO_EMPLOYEE_ID,
    name: 'Sarah Manager',
    email: 'manager@servicepro.com',
    role: 'manager',
    department: 'Audit',
  },
  receptionist: {
    id: DEMO_EMPLOYEE_ID,
    name: 'Mike Reception',
    email: 'reception@servicepro.com',
    role: 'receptionist',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login - check email suffix to determine role
    if (email.includes('admin')) {
      setUser(demoUsers.super_admin);
      return true;
    } else if (email.includes('manager')) {
      setUser(demoUsers.manager);
      return true;
    } else if (email.includes('reception')) {
      setUser(demoUsers.receptionist);
      return true;
    }
    // Default to receptionist for demo
    if (password.length > 0) {
      setUser(demoUsers.receptionist);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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

// Demo users for different roles - using real employee IDs from production database
const demoUsers: Record<UserRole, User> = {
  super_admin: {
    id: 'ed6bd312-47e1-4ab5-9585-2c73c63533b7', // Priya Mehta (Manager)
    name: 'Admin User',
    email: 'admin@servicepro.com',
    role: 'super_admin',
    avatar: undefined,
  },
  manager: {
    id: 'ed6bd312-47e1-4ab5-9585-2c73c63533b7', // Priya Mehta (Manager)
    name: 'Sarah Manager',
    email: 'manager@servicepro.com',
    role: 'manager',
    department: 'Income Tax',
  },
  receptionist: {
    id: 'ed6bd312-47e1-4ab5-9585-2c73c63533b7', // Priya Mehta (Manager)
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

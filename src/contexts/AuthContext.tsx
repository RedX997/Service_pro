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

// Demo users for different roles
const demoUsers: Record<UserRole, User> = {
  super_admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@servicepro.com',
    role: 'super_admin',
    avatar: undefined,
  },
  manager: {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@servicepro.com',
    role: 'manager',
    department: 'GST Services',
  },
  receptionist: {
    id: '3',
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

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

// Demo users for different roles - using real employee IDs from database
const demoUsers: Record<UserRole, User> = {
  super_admin: {
    id: 'fcd0aebb-b7b3-41e4-8b8b-f65c6841dd4f', // shyaam (Partner)
    name: 'Admin User',
    email: 'admin@servicepro.com',
    role: 'super_admin',
    avatar: undefined,
  },
  manager: {
    id: 'ad10385f-5277-4a20-a64b-c3abdc41b6f1', // Priya Mehta (Manager)
    name: 'Sarah Manager',
    email: 'manager@servicepro.com',
    role: 'manager',
    department: 'Income Tax',
  },
  receptionist: {
    id: '503ee07f-1153-4804-bc69-4fcbf7dfd379', // Ankit Sharma (Senior Associate)
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

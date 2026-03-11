import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Will be set dynamically from the first employee in database
let DEMO_EMPLOYEE_ID = 'loading...';

// Demo users for different roles
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

  // Fetch first employee ID on mount
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const response = await fetch('/employees');
        const employees = await response.json();
        
        if (employees && employees.length > 0) {
          DEMO_EMPLOYEE_ID = employees[0].id;
          
          // Update all demo users with the real employee ID
          demoUsers.super_admin.id = DEMO_EMPLOYEE_ID;
          demoUsers.manager.id = DEMO_EMPLOYEE_ID;
          demoUsers.receptionist.id = DEMO_EMPLOYEE_ID;
          
          console.log('✅ Using employee:', employees[0].name, '(ID:', DEMO_EMPLOYEE_ID, ')');
        } else {
          console.error('❌ No employees found in database');
        }
      } catch (error) {
        console.error('❌ Failed to fetch employee ID:', error);
      }
    };
    
    fetchEmployeeId();
  }, []);

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

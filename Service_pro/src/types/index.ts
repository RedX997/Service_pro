export type UserRole = 'super_admin' | 'manager' | 'receptionist' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  department?: string;
}

export interface Visitor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string; // Backward compatibility - maps to phone
  purpose: string;
  assignedTo?: string;
  hostId?: string; // Database field
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'waiting' | 'in-meeting' | 'completed' | 'converted' | 'active';
  notes?: string;
  nextReminderDate?: Date;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: string;
  avatarUrl?: string;
  createdAt: Date;
  // Optional frontend fields
  services?: string[];
  assignedEmployee?: string;
  lastContact?: Date;
  mobile?: string; // Backward compatibility
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  departmentId: string;
  requiredDocuments: string[];
  estimatedTime?: number;
}

export interface Message {
  id: string;
  clientId: string;
  senderId: string;
  senderType: 'client' | 'employee';
  content: string;
  timestamp: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  createdAt: Date;
}

export interface ActiveTimer {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  startTime: Date;
  notes?: string;
  createdAt: Date;
}

export interface Stats {
  totalClients: number;
  activeVisitors: number;
  pendingTasks: number;
  redzoneChats: number;
  billableHours: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  clientLoad?: number;
  maxLoad?: number;
  billableHours?: number;
  joinDate?: Date;
  createdAt: Date;
}

// Initial data for the application
import { Client, Visitor, Department, Service, Message, TimeEntry } from '@/types';

export const initialClients: Client[] = [
  {
    id: '1',
    name: 'ABC Enterprises',
    email: 'rajesh@abc.com',
    phone: '+91 98765 43210',
    company: 'ABC Enterprises',
    address: 'Mumbai, Maharashtra',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    services: ['GST Filing', 'ITR'],
    assignedEmployee: 'Ankit Sharma',
    lastContact: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'XYZ Solutions Pvt Ltd',
    email: 'priya@xyz.com',
    phone: '+91 87654 32109',
    company: 'XYZ Solutions Pvt Ltd',
    address: 'Delhi, India',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    services: ['Company Audit'],
    assignedEmployee: 'Priya Mehta',
    lastContact: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Patel & Associates',
    email: 'amit@patel.com',
    phone: '+91 76543 21098',
    company: 'Patel & Associates',
    address: 'Ahmedabad, Gujarat',
    status: 'active',
    createdAt: new Date('2024-01-22'),
    services: ['Tax Consultation', 'GST Registration'],
    assignedEmployee: 'Rahul Verma',
  },
];

export const initialVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    mobile: '+91 98765 43210',
    purpose: 'GST Registration Inquiry',
    assignedTo: 'Ankit Sharma',
    checkInTime: new Date(),
    status: 'waiting',
    notes: 'New business setup, needs GST registration guidance',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Priya Sharma',
    mobile: '+91 87654 32109',
    purpose: 'ITR Filing',
    assignedTo: 'Priya Mehta',
    checkInTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'in-meeting',
    notes: 'Annual tax filing for FY 2023-24',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export const initialDepartments: Department[] = [
  {
    id: '1',
    name: 'GST Services',
    description: 'Goods and Services Tax related services',
    services: [
      {
        id: '1',
        name: 'GST Registration',
        departmentId: '1',
        requiredDocuments: ['PAN Card', 'Aadhaar Card', 'Business Registration', 'Bank Statement'],
        estimatedTime: 7,
      },
      {
        id: '2',
        name: 'GST Filing',
        departmentId: '1',
        requiredDocuments: ['Sales Invoices', 'Purchase Invoices', 'Bank Statements'],
        estimatedTime: 3,
      },
    ],
  },
  {
    id: '2',
    name: 'Income Tax',
    description: 'Individual and corporate income tax services',
    services: [
      {
        id: '3',
        name: 'ITR Filing',
        departmentId: '2',
        requiredDocuments: ['Form 16', 'Bank Statements', 'Investment Proofs'],
        estimatedTime: 5,
      },
    ],
  },
];

export const initialMessages: Message[] = [
  {
    id: '1',
    clientId: '1',
    senderId: '1',
    senderType: 'client',
    content: 'Hi, I need help with my GST filing for this month.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    clientId: '1',
    senderId: 'emp1',
    senderType: 'employee',
    content: 'Sure! I can help you with that. Please share your sales and purchase invoices.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export const initialTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeId: 'emp1',
    clientId: '1',
    serviceId: '2',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    duration: 120, // 2 hours in minutes
    notes: 'GST filing for ABC Enterprises',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
];

export const employees = [
  { id: 'emp1', name: 'Ankit Sharma', email: 'ankit@servicepro.com', department: 'GST Services', role: 'Senior Associate' },
  { id: 'emp2', name: 'Priya Mehta', email: 'priya@servicepro.com', department: 'Income Tax', role: 'Manager' },
  { id: 'emp3', name: 'Rahul Verma', email: 'rahul@servicepro.com', department: 'Audit', role: 'Associate' },
  { id: 'emp4', name: 'Kavita Reddy', email: 'kavita@servicepro.com', department: 'GST Services', role: 'Associate' },
  { id: 'emp5', name: 'Suresh Kumar', email: 'suresh@servicepro.com', department: 'Tax Consultation', role: 'Senior Associate' },
];

export const availableServices = [
  'GST Filing',
  'ITR Filing',
  'Company Audit',
  'Tax Consultation',
  'GST Registration',
  'Company Registration',
  'Audit',
  'Compliance',
  'Bookkeeping',
  'TDS Filing',
  'ESI Registration',
  'PF Registration',
];
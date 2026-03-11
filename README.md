# ServicePro Management System

A comprehensive service management platform for professional service organizations to manage clients, employees, visitors, appointments, and time tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Key Features](#key-features)
- [Workflow](#workflow)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

## 🎯 Overview

ServicePro is a full-stack management system designed for service-based businesses. It provides tools for:

- Client relationship management (CRM)
- Visitor check-in/check-out tracking
- Employee workload management
- Task assignment and tracking
- Time tracking and billing
- Department and service management
- Real-time messaging
- Comprehensive reporting and analytics

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  │  (Routes)    │  │   (UI/UX)    │  │  (Logic)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │  API Client │                          │
│                    │   (Axios)   │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   REST API     │
                    │   (Express)    │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │     Prisma     │
                    │      ORM       │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │    Database    │
                    └────────────────┘
```

### Frontend Architecture

The frontend follows a modular React architecture with clear separation of concerns:

```
src/
├── pages/           # Route components (Dashboard, Clients, etc.)
├── components/      # Reusable UI components
│   ├── ui/         # Base UI components (shadcn/ui)
│   ├── dialogs/    # Modal dialogs
│   ├── filters/    # Filter components
│   ├── dashboard/  # Dashboard-specific components
│   └── layout/     # Layout components
├── hooks/          # Custom React hooks for data fetching
├── contexts/       # React Context providers (Auth)
├── services/       # API service layer
├── lib/            # Utilities and helpers
└── types/          # TypeScript type definitions
```

### Backend Architecture

The backend is built with Express.js and follows a route-based structure:

```
server/
├── src/
│   ├── index.ts           # Express app entry point
│   ├── routes/            # API route handlers
│   │   ├── clients.ts
│   │   ├── employees.ts
│   │   ├── visitors.ts
│   │   ├── tasks.ts
│   │   ├── messages.ts
│   │   ├── time-entries.ts
│   │   ├── departments.ts
│   │   └── seed.ts
│   └── lib/
│       └── prisma.ts      # Prisma client instance
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Database seeding script
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.30
- **State Management**: 
  - React Context (Authentication)
  - TanStack Query (Server state)
- **UI Library**: 
  - Radix UI (Headless components)
  - shadcn/ui (Component library)
  - Tailwind CSS (Styling)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.2
- **ORM**: Prisma 6.19
- **Database**: PostgreSQL
- **Validation**: Zod
- **CORS**: Enabled for cross-origin requests

### Development Tools
- **Package Manager**: npm/bun
- **Linting**: ESLint
- **Testing**: Vitest + Testing Library
- **Dev Server**: tsx watch (backend), Vite (frontend)

## 📁 Project Structure

```
Service pro/management practice/
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── dialogs/             # Modal dialogs
│   │   ├── filters/             # Filter components
│   │   ├── dashboard/           # Dashboard widgets
│   │   └── layout/              # Layout components
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Visitors.tsx
│   │   ├── Employees.tsx
│   │   ├── Appointments.tsx
│   │   ├── Messages.tsx
│   │   ├── TimeTracking.tsx
│   │   ├── Departments.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useClients.ts
│   │   ├── useVisitors.ts
│   │   ├── useEmployees.ts
│   │   ├── useTasks.ts
│   │   ├── useMessages.ts
│   │   └── useTimeTracking.ts
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── services/                # API service layer
│   │   ├── base-service.ts
│   │   ├── mock-service.ts
│   │   └── index.ts
│   ├── lib/                     # Utilities
│   │   ├── api-client.ts        # Axios instance
│   │   ├── storage.ts           # LocalStorage utilities
│   │   ├── utils.ts             # Helper functions
│   │   └── data.ts              # Mock data
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── server/                       # Backend source code
│   ├── src/
│   │   ├── index.ts             # Express server
│   │   ├── routes/              # API routes
│   │   └── lib/
│   │       └── prisma.ts        # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed data
│   └── package.json
│
├── dist/                         # Production build output
├── .env                          # Environment variables
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 📊 Data Models

### Core Entities

#### Client
```typescript
{
  id: string (UUID)
  name: string
  email: string
  phone: string
  company?: string
  address?: string
  status: string (default: "active")
  services: string[]
  assignedEmployee?: string
  lastContact?: Date
  createdAt: Date
}
```

#### Employee
```typescript
{
  id: string (UUID)
  name: string
  email?: string
  phone?: string
  mobile?: string
  role: string
  department?: string
  status: string (default: "active")
  createdAt: Date
}
```

#### Visitor
```typescript
{
  id: string (UUID)
  name: string
  email?: string
  phone?: string
  purpose: string
  hostId?: string (Employee ID)
  checkInTime: Date
  checkOutTime?: Date
  status: string (default: "active")
  notes?: string
  createdAt: Date
}
```

#### Task
```typescript
{
  id: string (UUID)
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  assignedTo: string (Employee ID)
  assignedBy?: string (Employee ID)
  clientId?: string
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### TimeEntry
```typescript
{
  id: string (UUID)
  employeeId: string
  clientId: string
  serviceId: string
  startTime: Date
  endTime?: Date
  duration?: number (minutes)
  notes?: string
  createdAt: Date
}
```

#### Message
```typescript
{
  id: string (UUID)
  content: string
  senderId: string
  senderType: "client" | "employee"
  clientId: string
  isRead: boolean
  timestamp: Date
  createdAt: Date
}
```

#### Department
```typescript
{
  id: string (UUID)
  name: string (unique)
  description?: string
  employees: number
  services: number
  activeClients: number
  createdAt: Date
  updatedAt: Date
}
```

### Entity Relationships

```
Client ──┬── Messages (1:N)
         ├── TimeEntries (1:N)
         └── Tasks (1:N)

Employee ──┬── TimeEntries (1:N)
           ├── Messages (1:N)
           ├── AssignedTasks (1:N)
           └── CreatedTasks (1:N)

Visitor ──── Employee (N:1, via hostId)

Task ──┬── Employee (Assignee) (N:1)
       ├── Employee (Assigner) (N:1)
       └── Client (N:1)
```

## ✨ Key Features

### 1. Dashboard
- Real-time statistics (clients, visitors, tasks, messages)
- Quick action buttons
- Recent activity feed
- Department overview
- Billable hours tracking

### 2. Client Management
- Complete client database
- Service assignment
- Employee assignment
- Contact history
- Status tracking (active/inactive)
- Advanced filtering and search

### 3. Visitor Management
- Check-in/check-out system
- Purpose tracking
- Host assignment
- Status management (waiting, in-meeting, completed, converted)
- Visitor-to-client conversion
- Reminder scheduling

### 4. Employee Management
- Employee directory
- Department assignment
- Role management
- Workload tracking
- Task assignment
- Performance metrics

### 5. Task Management
- Task creation and assignment
- Priority levels (low, medium, high, urgent)
- Status tracking (pending, in progress, completed, cancelled)
- Due date management
- Client association
- Workload visualization

### 6. Time Tracking
- Start/stop timers
- Service-based tracking
- Client association
- Duration calculation
- Billable hours reporting
- Active timer management

### 7. Messaging
- Client-employee communication
- Read/unread status
- Timestamp tracking
- Real-time updates

### 8. Appointments
- Appointment scheduling
- Client association
- Status management
- Date/time tracking

### 9. Departments
- Department management
- Service catalog
- Employee count
- Active client tracking

### 10. Reports & Analytics
- Client reports
- Employee performance
- Time tracking summaries
- Department analytics
- Custom date ranges

## 🔄 Workflow

### User Authentication Flow
```
1. User visits application
2. Redirected to /login if not authenticated
3. Enter credentials (demo mode: any email/password)
4. AuthContext validates and stores user session
5. Redirect to /dashboard
6. Protected routes check authentication status
```

### Client Management Workflow
```
1. View clients list (/clients)
2. Filter/search clients
3. Add new client (dialog form)
4. Assign employee to client
5. Assign services to client
6. Track client interactions
7. Update client status
8. View client history
```

### Visitor Management Workflow
```
1. Visitor arrives → Check-in (/visitors)
2. Record: name, purpose, host
3. Status: "waiting"
4. Host notified
5. Meeting starts → Status: "in-meeting"
6. Meeting ends → Check-out
7. Status: "completed"
8. Optional: Convert to client
```

### Task Assignment Workflow
```
1. Manager creates task
2. Select employee (checks workload)
3. Set priority and due date
4. Associate with client (optional)
5. Employee receives task
6. Update status as work progresses
7. Mark complete when done
8. Track completion metrics
```

### Time Tracking Workflow
```
1. Employee starts timer
2. Select client and service
3. Timer runs (tracked in real-time)
4. Add notes during work
5. Stop timer when complete
6. Duration auto-calculated
7. Entry saved to database
8. Billable hours updated
```

### Data Flow

#### Frontend → Backend
```
Component → Hook → API Client → Express Route → Prisma → Database
```

#### Backend → Frontend
```
Database → Prisma → Express Route → API Client → Hook → Component
```

### State Management

#### Server State (TanStack Query)
- API data caching
- Automatic refetching
- Optimistic updates
- Error handling
- Loading states

#### Client State (React Context)
- Authentication state
- User session
- Role-based access

#### Local State (React useState)
- Form inputs
- UI state (modals, filters)
- Temporary data

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- npm or bun package manager

### Environment Variables

Create `.env` file in the root directory:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_API=true

# Backend (in server/.env)
DATABASE_URL=postgresql://user:password@localhost:5432/servicepro
PORT=3000
NODE_ENV=development
```

### Installation Steps

1. **Clone the repository**
```bash
cd "Service pro/management practice"
```

2. **Install frontend dependencies**
```bash
npm install
# or
bun install
```

3. **Install backend dependencies**
```bash
cd server
npm install
# or
bun install
```

4. **Setup database**
```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## 💻 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

#### Backend
```bash
npm run dev              # Start development server with watch
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database
npm run prisma:reset     # Reset database
```

### Adding New Features

1. **Add Database Model**
   - Update `server/prisma/schema.prisma`
   - Run `npx prisma migrate dev --name feature_name`

2. **Create API Route**
   - Add route file in `server/src/routes/`
   - Register route in `server/src/index.ts`

3. **Create Frontend Hook**
   - Add hook in `src/hooks/`
   - Use TanStack Query for data fetching

4. **Create UI Components**
   - Add components in `src/components/`
   - Use shadcn/ui components

5. **Add Page Route**
   - Create page in `src/pages/`
   - Register route in `src/App.tsx`

### Code Style Guidelines

- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components
- Implement proper error handling
- Add loading states
- Use semantic HTML
- Follow accessibility guidelines
- Write meaningful commit messages

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Build the application**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
vercel deploy
```

3. **Set environment variables in Vercel**
```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_USE_API=true
```

### Backend Deployment (Render/Railway)

1. **Prepare for deployment**
```bash
cd server
npm run build
```

2. **Set environment variables**
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
```

3. **Deploy**
- Push to GitHub
- Connect repository to hosting platform
- Configure build command: `cd server && npm install && npm run build`
- Configure start command: `cd server && npm start`

### Database Migration

For production database:
```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-backend-url.com/api
```

### Endpoints

#### Clients
```
GET    /api/clients           # Get all clients
GET    /api/clients/:id       # Get client by ID
POST   /api/clients           # Create new client
PUT    /api/clients/:id       # Update client
DELETE /api/clients/:id       # Delete client
```

#### Employees
```
GET    /api/employees         # Get all employees
GET    /api/employees/:id     # Get employee by ID
POST   /api/employees         # Create new employee
PUT    /api/employees/:id     # Update employee
DELETE /api/employees/:id     # Delete employee
```

#### Visitors
```
GET    /api/visitors          # Get all visitors
GET    /api/visitors/:id      # Get visitor by ID
POST   /api/visitors          # Create new visitor
PUT    /api/visitors/:id      # Update visitor (check-out)
DELETE /api/visitors/:id      # Delete visitor
```

#### Tasks
```
GET    /api/tasks             # Get all tasks
GET    /api/tasks/:id         # Get task by ID
POST   /api/tasks             # Create new task
PUT    /api/tasks/:id         # Update task
DELETE /api/tasks/:id         # Delete task
```

#### Time Entries
```
GET    /api/time-entries      # Get all time entries
GET    /api/time-entries/:id  # Get time entry by ID
POST   /api/time-entries      # Create new time entry
PUT    /api/time-entries/:id  # Update time entry
DELETE /api/time-entries/:id  # Delete time entry
```

#### Messages
```
GET    /api/messages          # Get all messages
GET    /api/messages/:id      # Get message by ID
POST   /api/messages          # Create new message
PUT    /api/messages/:id      # Mark as read
DELETE /api/messages/:id      # Delete message
```

#### Departments
```
GET    /api/departments       # Get all departments
GET    /api/departments/:id   # Get department by ID
POST   /api/departments       # Create new department
PUT    /api/departments/:id   # Update department
DELETE /api/departments/:id   # Delete department
```

#### Seed
```
POST   /api/seed              # Seed database with sample data
```

### Request/Response Examples

#### Create Client
```http
POST /api/clients
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "address": "123 Main St",
  "services": ["Audit", "Tax"],
  "assignedEmployee": "employee-uuid"
}
```

Response:
```json
{
  "id": "client-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "address": "123 Main St",
  "status": "active",
  "services": ["Audit", "Tax"],
  "assignedEmployee": "employee-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For internal development guidelines, please contact the project maintainer.

## 📞 Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Maintained by**: ServicePro Development Team

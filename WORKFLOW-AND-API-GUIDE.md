# 🔄 ServicePro Workflow, PostgreSQL Benefits & API Guide

## 📊 Complete Application Workflow

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 8080)                   │  │
│  │  - UI Components (Buttons, Forms, Tables)            │  │
│  │  - React Router (Navigation)                         │  │
│  │  - React Query (Data Caching)                        │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│                   │ VITE_USE_API = true/false?             │
│                   │                                         │
│         ┌─────────▼──────────┐                             │
│         │  Service Layer     │                             │
│         │  (Smart Switch)    │                             │
│         └─────────┬──────────┘                             │
│                   │                                         │
│      ┌────────────┴────────────┐                           │
│      │                         │                           │
│   [TRUE]                    [FALSE]                        │
│      │                         │                           │
└──────┼─────────────────────────┼───────────────────────────┘
       │                         │
       │                         │
   ┌───▼────────────┐    ┌──────▼──────────┐
   │  API Client    │    │  LocalStorage   │
   │  (Axios)       │    │  (Browser)      │
   └───┬────────────┘    └─────────────────┘
       │
       │ HTTP Requests
       │ (GET, POST, PATCH, DELETE)
       │
┌──────▼──────────────────────────────────────────────────────┐
│           Express Backend (Port 3000)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  /api/clients     - Client management                │  │
│  │  /api/employees   - Employee management              │  │
│  │  /api/visitors    - Visitor tracking                 │  │
│  │  /api/messages    - Communication                    │  │
│  │  /api/time-entries - Time tracking                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Prisma ORM                                          │  │
│  │  - Type-safe database queries                        │  │
│  │  - Automatic SQL generation                          │  │
│  │  - Migration management                              │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    │ SQL Queries
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              PostgreSQL Database                            │
│                                                             │
│  Tables: Client, Employee, Visitor, Message, TimeEntry     │
│  - Persistent storage                                       │
│  - ACID transactions                                        │
│  - Relationships & constraints                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Step-by-Step User Workflow

### Example: Adding a New Client

**1. User Action (Browser)**
```
User clicks "Add Client" button → Fills form → Clicks "Save"
```

**2. Frontend Processing**
```typescript
// React component calls the service
import { clientService } from '@/services';

const handleSubmit = async (data) => {
  const newClient = await clientService.create(data);
  // UI updates automatically via React Query
};
```

**3. Service Layer Decision**
```typescript
// services/index.ts checks environment variable
const USE_API = import.meta.env.VITE_USE_API === 'true';

// If TRUE: Use API (PostgreSQL)
export const clientService = USE_API 
  ? new ClientApiService()      // → Goes to backend
  : new MockService();           // → Saves to localStorage
```

**4A. API Path (PostgreSQL)**
```typescript
// Frontend → Backend
apiClient.post('/clients', data)
  ↓
// Backend receives request
router.post('/', async (req, res) => {
  const client = await prisma.client.create({
    data: req.body
  });
  res.json(client);
})
  ↓
// Prisma → PostgreSQL
INSERT INTO "Client" (id, name, email, phone, ...) 
VALUES (uuid, 'John Doe', 'john@example.com', ...)
  ↓
// Response flows back
PostgreSQL → Prisma → Express → Axios → React → UI Update
```

**4B. LocalStorage Path (No Database)**
```typescript
// Frontend saves directly to browser
const clients = localStorage.getItem('servicepro_clients');
const updated = [...clients, newClient];
localStorage.setItem('servicepro_clients', JSON.stringify(updated));
  ↓
// UI updates immediately
```

---

## 🏆 Why PostgreSQL is Better for This Project

### Current Setup (LocalStorage)

| Aspect | LocalStorage | Issue |
|--------|-------------|-------|
| **Storage** | Browser only | Data lost if browser cache cleared |
| **Capacity** | 5-10 MB limit | Can't store large datasets |
| **Multi-user** | ❌ No | Each user has separate data |
| **Backup** | ❌ No | No automatic backups |
| **Security** | ❌ Low | Anyone can access browser storage |
| **Queries** | ❌ Limited | Can't do complex searches |
| **Relationships** | ❌ Manual | Hard to maintain data integrity |

### With PostgreSQL

| Aspect | PostgreSQL | Benefit |
|--------|-----------|---------|
| **Storage** | Server-side | ✅ Data persists forever |
| **Capacity** | Unlimited* | ✅ Store millions of records |
| **Multi-user** | ✅ Yes | ✅ All users see same data |
| **Backup** | ✅ Yes | ✅ Automatic backups possible |
| **Security** | ✅ High | ✅ Password protected, encrypted |
| **Queries** | ✅ SQL | ✅ Complex searches, filters, joins |
| **Relationships** | ✅ Built-in | ✅ Foreign keys, cascading deletes |

### Real-World Scenarios

**Scenario 1: Multiple Employees**
- **LocalStorage:** Each employee sees different data on their computer
- **PostgreSQL:** All employees see the same clients, appointments, messages

**Scenario 2: Data Loss**
- **LocalStorage:** User clears browser cache → All data gone forever
- **PostgreSQL:** Data is safe on server, can be backed up daily

**Scenario 3: Reporting**
- **LocalStorage:** Can't generate reports across all users
- **PostgreSQL:** Generate company-wide reports, analytics, trends

**Scenario 4: Mobile Access**
- **LocalStorage:** Can't access from phone (different browser)
- **PostgreSQL:** Access from anywhere (phone, tablet, laptop)

**Scenario 5: Data Integrity**
- **LocalStorage:** Can have orphaned records (message without client)
- **PostgreSQL:** Foreign keys ensure data consistency

---

## 🔌 API Connection Details

### Available API Endpoints

#### 1. **Clients API** (`/api/clients`)

```typescript
// GET all clients
GET http://localhost:3000/api/clients
Response: Client[]

// GET single client
GET http://localhost:3000/api/clients/:id
Response: Client

// CREATE client
POST http://localhost:3000/api/clients
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 98765 43210",
  company: "ABC Corp",
  address: "Mumbai, India",
  status: "active"
}
Response: Client

// UPDATE client
PATCH http://localhost:3000/api/clients/:id
Body: {
  phone: "+91 99999 88888"
}
Response: Client

// DELETE client
DELETE http://localhost:3000/api/clients/:id
Response: { message: "Client deleted" }
```

#### 2. **Employees API** (`/api/employees`)

```typescript
// GET all employees
GET http://localhost:3000/api/employees
Response: Employee[]

// CREATE employee
POST http://localhost:3000/api/employees
Body: {
  name: "Jane Smith",
  email: "jane@company.com",
  phone: "+91 98765 11111",
  role: "Senior Consultant",
  department: "Sales",
  status: "active"
}
Response: Employee

// UPDATE employee
PATCH http://localhost:3000/api/employees/:id
Body: { role: "Lead Consultant" }
Response: Employee
```

#### 3. **Visitors API** (`/api/visitors`)

```typescript
// GET all visitors
GET http://localhost:3000/api/visitors
Response: Visitor[]

// CREATE visitor (check-in)
POST http://localhost:3000/api/visitors
Body: {
  name: "Guest Name",
  email: "guest@example.com",
  phone: "+91 98765 22222",
  purpose: "Meeting with CEO",
  hostId: "employee-uuid"
}
Response: Visitor

// CHECK OUT visitor
POST http://localhost:3000/api/visitors/:id/checkout
Response: Visitor (with checkOutTime)

// CONVERT to client
POST http://localhost:3000/api/visitors/:id/convert
Body: {
  company: "Guest Company",
  address: "Guest Address"
}
Response: { visitor: Visitor, clientId: string }
```

#### 4. **Messages API** (`/api/messages`)

```typescript
// GET all messages
GET http://localhost:3000/api/messages
Response: Message[]

// CREATE message
POST http://localhost:3000/api/messages
Body: {
  content: "Hello, how can we help?",
  senderId: "employee-uuid",
  senderType: "employee",
  clientId: "client-uuid"
}
Response: Message

// MARK as read
PATCH http://localhost:3000/api/messages/:id/read
Response: Message (with isRead: true)
```

#### 5. **Time Entries API** (`/api/time-entries`)

```typescript
// GET all time entries
GET http://localhost:3000/api/time-entries
Response: TimeEntry[]

// START timer
POST http://localhost:3000/api/time-entries/start
Body: {
  employeeId: "employee-uuid",
  clientId: "client-uuid",
  serviceId: "service-uuid",
  notes: "Working on project X"
}
Response: ActiveTimer

// STOP timer
POST http://localhost:3000/api/time-entries/stop
Body: {
  employeeId: "employee-uuid",
  notes: "Completed task"
}
Response: TimeEntry (with duration calculated)

// GET active timer
GET http://localhost:3000/api/time-entries/active/:employeeId
Response: ActiveTimer | null
```

---

## 🛠️ How to Make API Connections

### Method 1: Using the Built-in Service Layer (Recommended)

```typescript
// In any React component
import { clientService } from '@/services';

// Get all clients
const clients = await clientService.getAll();

// Create client
const newClient = await clientService.create({
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 98765 43210"
});

// Update client
const updated = await clientService.update(clientId, {
  phone: "+91 99999 88888"
});

// Delete client
await clientService.delete(clientId);
```

### Method 2: Direct API Client Usage

```typescript
// In any React component
import { apiClient } from '@/lib/api-client';

// GET request
const clients = await apiClient.get('/clients');

// POST request
const newClient = await apiClient.post('/clients', {
  name: "John Doe",
  email: "john@example.com"
});

// PATCH request
const updated = await apiClient.patch(`/clients/${id}`, {
  phone: "+91 99999 88888"
});

// DELETE request
await apiClient.delete(`/clients/${id}`);
```

### Method 3: Using React Query (Best for React)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientService } from '@/services';

function ClientList() {
  // Fetch data with caching
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll()
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => clientService.create(data),
    onSuccess: () => {
      // Refetch clients after creation
      queryClient.invalidateQueries(['clients']);
    }
  });

  const handleCreate = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      {isLoading ? 'Loading...' : clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔧 Switching Between LocalStorage and PostgreSQL

### Current Mode Check

Check your `.env` file:
```env
VITE_USE_API=true   # Uses PostgreSQL via API
VITE_USE_API=false  # Uses LocalStorage
```

### To Use PostgreSQL:

1. **Set environment variable:**
   ```env
   # Service pro/management practice/.env
   VITE_USE_API=true
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. **Setup database** (see POSTGRESQL-SETUP-GUIDE.md)

3. **Start backend server:**
   ```cmd
   cd "Service pro/management practice/server"
   npm run dev
   ```

4. **Restart frontend:**
   ```cmd
   cd "Service pro/management practice"
   npm run dev
   ```

### To Use LocalStorage:

1. **Set environment variable:**
   ```env
   # Service pro/management practice/.env
   VITE_USE_API=false
   ```

2. **Restart frontend** (backend not needed)

---

## 🧪 Testing API Endpoints

### Using Browser (Simple)

```
http://localhost:3000/api/clients
http://localhost:3000/api/employees
http://localhost:3000/health
```

### Using Postman (Professional)

1. Download Postman: https://www.postman.com/downloads/
2. Create new request
3. Set method (GET, POST, PATCH, DELETE)
4. Enter URL: `http://localhost:3000/api/clients`
5. For POST/PATCH, add JSON body:
   ```json
   {
     "name": "Test Client",
     "email": "test@example.com",
     "phone": "+91 98765 43210"
   }
   ```
6. Click "Send"

### Using cURL (Command Line)

```bash
# GET all clients
curl http://localhost:3000/api/clients

# CREATE client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"phone\":\"+91 98765 43210\"}"

# UPDATE client
curl -X PATCH http://localhost:3000/api/clients/CLIENT_ID \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+91 99999 88888\"}"

# DELETE client
curl -X DELETE http://localhost:3000/api/clients/CLIENT_ID
```

---

## 🔐 API Security (Future Enhancements)

Currently, the API is open (no authentication). For production, you should add:

### 1. Authentication
```typescript
// Add JWT tokens
import jwt from 'jsonwebtoken';

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Verify credentials
  const token = jwt.sign({ userId: user.id }, SECRET_KEY);
  res.json({ token });
});
```

### 2. Authorization Middleware
```typescript
// Protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/api/clients', authMiddleware, clientRoutes);
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 Performance Benefits

### With PostgreSQL:
- **Indexing:** Fast searches on millions of records
- **Caching:** React Query caches API responses
- **Pagination:** Load 20 records at a time, not all
- **Lazy Loading:** Fetch data only when needed
- **Optimistic Updates:** UI updates before server confirms

### Example: Pagination
```typescript
// Backend
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const clients = await prisma.client.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  res.json(clients);
});

// Frontend
const clients = await apiClient.get('/clients?page=1&limit=20');
```

---

## 🎯 Summary

**Workflow:**
1. User interacts with UI
2. Service layer decides: API or LocalStorage
3. If API: Frontend → Backend → PostgreSQL → Response
4. If LocalStorage: Frontend → Browser Storage → Response
5. UI updates with new data

**PostgreSQL Benefits:**
- ✅ Persistent, reliable storage
- ✅ Multi-user support
- ✅ Complex queries and relationships
- ✅ Scalable to millions of records
- ✅ Professional, production-ready

**API Connections:**
- 5 main endpoints (clients, employees, visitors, messages, time-entries)
- RESTful design (GET, POST, PATCH, DELETE)
- Easy to use with built-in service layer
- Can be tested with Postman or cURL

**Next Steps:**
1. Setup PostgreSQL (see POSTGRESQL-SETUP-GUIDE.md)
2. Set `VITE_USE_API=true` in `.env`
3. Start both servers
4. Your app now uses PostgreSQL! 🎉

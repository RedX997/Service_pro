# 🗄️ PostgreSQL Setup Guide for ServicePro

## 📋 What You Need to Do (Overview)

1. Install PostgreSQL on your computer
2. Create a database called `servicepro`
3. Update the connection string in your project
4. Run migrations to create tables
5. Start using the database

---

## 🎯 Step-by-Step Instructions

### Step 1: Install PostgreSQL

**Option A: Install Locally (Recommended for Learning)**

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set a password for the `postgres` user (REMEMBER THIS!)
   - Keep default port: `5432`
   - Install pgAdmin (GUI tool) - check the box
4. Verify installation:
   ```cmd
   psql --version
   ```
   Should show: `psql (PostgreSQL) 16.x` or similar

**Option B: Use Supabase (Cloud - Free Tier)**

1. Go to: https://supabase.com
2. Sign up for free account
3. Create a new project
4. Set a database password (REMEMBER THIS!)
5. Wait 2-3 minutes for database to be ready
6. Go to Project Settings → Database
7. Copy the "Connection string" (URI format)

---

### Step 2: Create the Database

**If using Local PostgreSQL:**

Open Command Prompt and run:
```cmd
psql -U postgres
```
Enter your password, then:
```sql
CREATE DATABASE servicepro;
\l
```
(You should see `servicepro` in the list)
```sql
\q
```
(Exit psql)

**If using Supabase:**
- Database is already created! Skip this step.

---

### Step 3: Update Connection String

Open the file: `Service pro/management practice/server/.env`

**For Local PostgreSQL:**
Replace the DATABASE_URL with:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/servicepro"
```

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/servicepro"
```

**For Supabase:**
Use the connection string from Supabase dashboard:
```env
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

---

### Step 4: Run Database Migrations

This creates all the tables automatically!

Open Command Prompt in your project folder:

```cmd
cd "Service pro/management practice/server"
npx prisma migrate dev --name init
```

This will:
- ✅ Create all 5 tables
- ✅ Set up relationships between tables
- ✅ Generate the Prisma client code

You should see:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

---

### Step 5: Verify Setup

**Check if tables were created:**

```cmd
psql -U postgres -d servicepro
\dt
```

You should see:
```
 Schema |   Name    | Type  |  Owner
--------+-----------+-------+----------
 public | Client    | table | postgres
 public | Employee  | table | postgres
 public | Message   | table | postgres
 public | TimeEntry | table | postgres
 public | Visitor   | table | postgres
```

Type `\q` to exit.

---

### Step 6: Start Your Application

Now restart both servers:

**Terminal 1 - Backend:**
```cmd
cd "Service pro/management practice/server"
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
cd "Service pro/management practice"
npm run dev
```

Open browser: http://localhost:8080

Now all data will be saved to PostgreSQL! 🎉

---

## 📊 Database Tables & Columns

Here's what gets created in your PostgreSQL database:

### 1. **Client** Table
Stores customer information

| Column    | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | UUID      | Unique identifier (auto)       |
| name      | String    | Client name                    |
| email     | String    | Email address                  |
| phone     | String    | Phone number                   |
| company   | String?   | Company name (optional)        |
| address   | String?   | Address (optional)             |
| status    | String    | active/inactive (default: active) |
| createdAt | DateTime  | When created (auto)            |

**Relationships:**
- Has many Messages
- Has many TimeEntries

---

### 2. **Employee** Table
Stores staff/team member information

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID      | Unique identifier (auto)       |
| name       | String    | Employee name                  |
| email      | String?   | Email (optional)               |
| phone      | String?   | Phone (optional)               |
| role       | String    | Job role/position              |
| department | String?   | Department (optional)          |
| status     | String    | active/inactive (default: active) |
| createdAt  | DateTime  | When created (auto)            |

**Relationships:**
- Has many TimeEntries
- Has many Messages

---

### 3. **Visitor** Table
Tracks office visitors

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | UUID      | Unique identifier (auto)       |
| name         | String    | Visitor name                   |
| email        | String?   | Email (optional)               |
| phone        | String?   | Phone (optional)               |
| purpose      | String    | Reason for visit               |
| hostId       | String?   | Who they're visiting (optional)|
| checkInTime  | DateTime  | When they arrived (auto)       |
| checkOutTime | DateTime? | When they left (optional)      |
| status       | String    | active/inactive (default: active) |
| createdAt    | DateTime  | When created (auto)            |

**Relationships:**
- None (standalone table)

---

### 4. **Message** Table
Communication between clients and employees

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID      | Unique identifier (auto)       |
| content    | String    | Message text                   |
| senderId   | String    | Who sent it (employee ID)      |
| senderType | String    | 'client' or 'employee'         |
| clientId   | String    | Related client                 |
| isRead     | Boolean   | Read status (default: false)   |
| timestamp  | DateTime  | When sent (auto)               |
| createdAt  | DateTime  | When created (auto)            |

**Relationships:**
- Belongs to Client (via clientId)
- Belongs to Employee (via senderId)

---

### 5. **TimeEntry** Table
Tracks billable hours and time spent

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID      | Unique identifier (auto)       |
| employeeId | String    | Who worked                     |
| clientId   | String    | For which client               |
| serviceId  | String    | What service/project           |
| startTime  | DateTime  | When started                   |
| endTime    | DateTime? | When ended (optional)          |
| duration   | Int?      | Minutes worked (optional)      |
| notes      | String?   | Additional notes (optional)    |
| createdAt  | DateTime  | When created (auto)            |

**Relationships:**
- Belongs to Employee (via employeeId)
- Belongs to Client (via clientId)

---

## 🔗 Database Relationships

```
Client
  ├── has many Messages
  └── has many TimeEntries

Employee
  ├── has many Messages
  └── has many TimeEntries

Visitor
  └── (no relationships)

Message
  ├── belongs to Client
  └── belongs to Employee

TimeEntry
  ├── belongs to Employee
  └── belongs to Client
```

---

## 🛠️ Useful Commands

### View Data in Tables
```cmd
psql -U postgres -d servicepro

-- View all clients
SELECT * FROM "Client";

-- View all employees
SELECT * FROM "Employee";

-- View all visitors
SELECT * FROM "Visitor";

-- Count records
SELECT COUNT(*) FROM "Client";

-- Exit
\q
```

### Reset Database (Delete All Data)
```cmd
cd "Service pro/management practice/server"
npx prisma migrate reset
```
⚠️ This deletes ALL data!

### Add Sample Data Manually
```sql
psql -U postgres -d servicepro

INSERT INTO "Client" (id, name, email, phone, company, status, "createdAt")
VALUES (
  gen_random_uuid(),
  'John Doe',
  'john@example.com',
  '+91 98765 43210',
  'ABC Corp',
  'active',
  NOW()
);
```

---

## 🎨 View Database with GUI Tools

### Option 1: pgAdmin (Comes with PostgreSQL)
1. Open pgAdmin
2. Connect to localhost
3. Navigate to: Servers → PostgreSQL → Databases → servicepro → Schemas → public → Tables
4. Right-click table → View/Edit Data

### Option 2: DBeaver (Free, Cross-platform)
1. Download: https://dbeaver.io/download/
2. Install and open
3. New Connection → PostgreSQL
4. Enter: localhost, port 5432, database: servicepro, user: postgres
5. Browse tables visually

### Option 3: Supabase Dashboard (If using Supabase)
1. Go to your Supabase project
2. Click "Table Editor" in sidebar
3. View and edit data directly in browser

---

## ❓ Troubleshooting

### Error: "password authentication failed"
- Wrong password in DATABASE_URL
- Check your PostgreSQL password

### Error: "database servicepro does not exist"
- Run: `psql -U postgres -c "CREATE DATABASE servicepro;"`

### Error: "could not connect to server"
- PostgreSQL service not running
- Windows: Open Services → Start "postgresql-x64-XX"
- Or run: `net start postgresql-x64-16`

### Error: "Port 5432 already in use"
- Another PostgreSQL instance is running
- Or change port in DATABASE_URL to 5433

### Error: "relation does not exist"
- Tables not created
- Run: `npx prisma migrate dev --name init`

### Backend shows "PrismaClient is unable to connect"
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Test connection: `psql -U postgres -d servicepro`

---

## ✅ Verification Checklist

Before you're done, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `servicepro` exists
- [ ] All 5 tables are created (Client, Employee, Visitor, Message, TimeEntry)
- [ ] Backend server starts without errors
- [ ] Frontend can add/view data
- [ ] Data persists after server restart

---

## 🎯 What Happens After Setup?

Once PostgreSQL is connected:

1. **Add a Client** in the app → Saved to `Client` table
2. **Add an Employee** → Saved to `Employee` table
3. **Track Time** → Saved to `TimeEntry` table
4. **Send Message** → Saved to `Message` table
5. **Check-in Visitor** → Saved to `Visitor` table

All data is now:
- ✅ Persistent (survives restarts)
- ✅ Shareable (multiple users can access)
- ✅ Queryable (can run SQL queries)
- ✅ Backed up (can export/import)
- ✅ Production-ready

---

## 📚 Additional Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma Docs: https://www.prisma.io/docs/
- Supabase Docs: https://supabase.com/docs
- SQL Tutorial: https://www.w3schools.com/sql/

---

**Need help?** Check the error message and refer to the Troubleshooting section above!

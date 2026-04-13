# 🚀 How to Run ServicePro Management System

## ✅ Project is Now Running!

**Frontend:** http://localhost:8080 (✅ Working)
**Backend:** http://localhost:3000 (⚠️ Needs database setup)

---

## 📋 What is This Project?

**ServicePro Management System** is a complete business management application for service-based companies. Think of it as an all-in-one tool to manage your business operations.

### Main Features:

1. **Dashboard** - See your business overview at a glance
2. **Client Management** - Keep track of all your customers
3. **Employee Management** - Manage your team and their workload
4. **Time Tracking** - Track billable hours for projects
5. **Appointments** - Schedule meetings with clients
6. **Visitor Management** - Track who visits your office
7. **Messages** - Communicate with clients
8. **Reports** - Generate business analytics and reports

---

## 🎯 Quick Start Steps (What I Just Did)

### Step 1: Installed Dependencies
```cmd
cd "Service pro/management practice"
npm install

cd server
npm install
```

### Step 2: Fixed Prisma (Database Tool)
```cmd
cd server
npm install prisma@^6.0.0 @prisma/client@^6.0.0
npx prisma generate
```

### Step 3: Started Both Servers
- **Frontend Server:** Running on port 8080
- **Backend Server:** Running on port 3000

---

## 🔧 How to Run It Yourself (Next Time)

### Option 1: Manual Start (Recommended)

1. **Start Backend:**
```cmd
cd "Service pro/management practice/server"
npm run dev
```

2. **Start Frontend (in a new terminal):**
```cmd
cd "Service pro/management practice"
npm run dev
```

3. **Open Browser:**
   - Go to: http://localhost:8080

### Option 2: Use the Quick Start Script
```cmd
cd "Service pro/management practice"
QUICK-START.bat
```

---

## 🗄️ Database Setup (Optional - For Full Functionality)

The app currently has a database connection issue. To fix it:

### Current Setup:
- Database: PostgreSQL (via Supabase)
- Location: `server/.env`

### To Fix:
1. Open `server/.env`
2. Update the `DATABASE_URL` with valid credentials:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.eolmwynekhgyrgucfphh.supabase.co:5432/postgres"
```

### Without Database:
The frontend still works with demo data stored in your browser (LocalStorage). You can:
- Add/edit/delete clients, employees, visitors
- Track time
- Create appointments
- Send messages
- Generate reports

All data is saved in your browser!

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 (UI framework)
- TypeScript (Programming language)
- Tailwind CSS (Styling)
- Vite (Build tool)

**Backend:**
- Node.js + Express (Server)
- Prisma (Database tool)
- PostgreSQL (Database)

---

## 📁 Project Structure

```
Service pro/management practice/
├── src/                    # Frontend code
│   ├── components/         # UI components
│   ├── pages/             # Different pages
│   └── lib/               # Utilities
├── server/                # Backend code
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── lib/           # Database connection
│   └── prisma/            # Database schema
└── package.json           # Dependencies
```

---

## 🎮 How to Use the App

1. **Open:** http://localhost:8080
2. **Navigate:** Use the sidebar menu to access different sections
3. **Add Data:** Click "Add" buttons to create clients, employees, etc.
4. **View Reports:** Go to Reports section for analytics
5. **Track Time:** Use the Time Tracking page to log hours

---

## 🔄 Common Commands

```cmd
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Deploy to GitHub Pages
npm run deploy
```

---

## ❓ Troubleshooting

### Port Already in Use?
If you see "Port 8080 is already in use":
```cmd
# Kill the process using the port
netstat -ano | findstr :8080
taskkill /PID [PID_NUMBER] /F
```

### Dependencies Not Found?
```cmd
# Reinstall dependencies
npm install
```

### Database Connection Error?
- The app works without database using LocalStorage
- To use database, update credentials in `server/.env`

---

## 🎉 You're All Set!

The project is running and ready to use. Open http://localhost:8080 in your browser and start exploring!

# 🚀 How to Run ServicePro Management System

## ✅ Project Quick Start

### Step 1: Start the Backend (Server)
Open a terminal in the root folder and run:
```cmd
cd server
npm run dev
```
*The server will run on http://localhost:3000.*

### Step 2: Start the Frontend (UI)
Open a **new** terminal in the root folder and run:
```cmd
npm run dev
```
*The application will open in your browser at http://localhost:8080 (or similar).*

---

## 📋 Features at a Glance

1. **Dashboard** - Business overview and real-time activity tracking.
2. **Client Management** - CRM for managing customer relationships.
3. **Employee Management** - Staff oversight and department assignments.
4. **Time Tracking** - Log billable hours and track task performance.
5. **Appointments** - Integrated calendar and scheduling system.
6. **Visitor Management** - Track check-ins and visitor status.
7. **Messaging** - Real-time communication and notifications.
8. **Reports** - Detailed business analytics and data exports.

---

## 🗄️ Database Setup

The application uses **PostgreSQL** (via Prisma). 

1. Create a `.env` file in the `server` folder (or use the existing one).
2. Configure your `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/servicepro"
   ```
3. Initialize the database:
   ```cmd
   cd server
   npx prisma db push
   npx prisma db seed
   ```

*Note: If no database is connected, the frontend still works with mock data for demonstration purposes.*

---

## 📁 Project Structure (Flattened)

```
/                          # Project Root
├── src/                   # Frontend React code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page views
│   └── hooks/             # Custom React hooks
├── server/                # Backend Node.js code
│   ├── src/               # API routes and controllers
│   └── prisma/            # Database schema and seeds
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── server/package.json    # Backend dependencies
```

---

## 🎮 Development Commands

```cmd
# Frontend Commands
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production

# Backend Commands
cd server
npm install      # Install dependencies
npm run dev      # Start server in watch mode
```

---

## ❓ Troubleshooting

### Port Conflicts
If you see "Port is already in use", you can find and kill the process:
```cmd
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Missing Dependencies
If you encounter "command not found" errors, ensure you have run `npm install` in both the root and the `server` directory.

---

## 🎉 Ready to Go!
Open http://localhost:8080 after starting both servers and you're all set!

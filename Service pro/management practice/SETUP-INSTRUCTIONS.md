# Complete Setup Instructions

## Prerequisites Check

1. **PostgreSQL is installed and running**
   - Check by opening Command Prompt and running: `psql --version`
   - If not installed, download from: https://www.postgresql.org/download/windows/

2. **You know your PostgreSQL password**
   - This is the password you set during PostgreSQL installation

## Setup Steps

### Step 1: Configure Database Connection

1. Open `server/.env` file
2. Replace `password` with your actual PostgreSQL password:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/servicepro?schema=public"
   ```
3. Save the file

### Step 2: Run Setup Script

**Option A: Automatic Setup (Recommended)**

1. Double-click `setup-database.bat`
2. Enter your PostgreSQL password when prompted
3. Wait for setup to complete

**Option B: Manual Setup**

Open Command Prompt in the project folder and run:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE servicepro;"

# Run migrations
cd server
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Step 3: Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Or double-click `start-backend.bat`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Or double-click `start-frontend.bat`

### Step 4: Access the Application

Open your browser and go to: **http://localhost:8080**

## Verification

Once both servers are running, you should see:

**Backend Terminal:**
```
Server is running at http://localhost:3000
```

**Frontend Terminal:**
```
Local: http://localhost:8080
```

## Test the Database Connection

1. Go to http://localhost:8080
2. Login with any credentials (demo mode)
3. Navigate to "Clients" page
4. Click "Add Client"
5. Fill in the form and save
6. The data should be saved to PostgreSQL!

## Troubleshooting

### Error: "Cannot connect to PostgreSQL"
- Make sure PostgreSQL service is running
- Check Windows Services for "postgresql-x64-XX"
- Verify your password in `server/.env`

### Error: "Database already exists"
- This is fine, the database was already created
- Continue with the next steps

### Error: "Port 3000 already in use"
- Change PORT in `server/.env` to 3001
- Update `VITE_API_BASE_URL` in root `.env` to http://localhost:3001/api

### Error: "Migration failed"
- Delete `server/prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

### Frontend shows "Network Error"
- Make sure backend server is running
- Check that `VITE_USE_API=true` in root `.env`
- Verify backend is accessible at http://localhost:3000/health

## Database Management

### View your data in PostgreSQL:
```bash
psql -U postgres -d servicepro
\dt                    # List all tables
SELECT * FROM "Client";  # View clients
\q                     # Quit
```

### Reset database:
```bash
cd server
npx prisma migrate reset
```

### View database in GUI:
- Use pgAdmin (comes with PostgreSQL)
- Or download DBeaver: https://dbeaver.io/

## Next Steps

Once everything is working:
1. ✅ All data is now stored in PostgreSQL
2. ✅ Data persists across server restarts
3. ✅ Multiple users can access the same data
4. ✅ Ready for production deployment

## Quick Commands Reference

```bash
# Check PostgreSQL status
pg_isready

# Create database
psql -U postgres -c "CREATE DATABASE servicepro;"

# Run migrations
cd server && npx prisma migrate dev

# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# View database
psql -U postgres -d servicepro
```

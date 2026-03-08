# ServicePro Management System

A full-stack business management application for service professionals.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS + Shadcn/ui
- TanStack Query
- React Router

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL

## Features

- Client Management
- Employee Management
- Visitor Tracking
- Appointment Scheduling
- Time Tracking
- Messaging System
- Department Management
- Reports & Analytics

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/RedX997/Service_pro.git
cd Service_pro
```

2. Install frontend dependencies
```bash
cd "Service pro/management practice"
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
```

4. Configure environment variables
```bash
# Create .env file in server directory
cp server/.env.example server/.env
# Edit server/.env with your database credentials
```

5. Run database migrations
```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

6. Start development servers

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd "Service pro/management practice"
npm run dev
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3000
NODE_ENV=development
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_API=true
```

## License

Private - All Rights Reserved

## Contact

For questions or support, please contact the repository owner.

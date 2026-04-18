# ServicePro — Practice Management System

A full-stack practice management platform for professional services firms. Manages client relationships, appointments, visitor tracking, employee operations, messaging, and task management.

## Features

- Role-based access control (Super Admin, Manager, Receptionist)
- Client & visitor management
- Appointment scheduling with calendar view
- Real-time messaging and notifications
- Employee and department management
- Time tracking
- Task management
- Cascade Admin portal for company-controlled credential management

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Real-time:** Socket.io
- **Hosting:** Vercel (frontend) + Render (backend)

## Live Demo

[https://service-pro-chi.vercel.app](https://service-pro-chi.vercel.app)

## Getting Started

1. **Install Dependencies** (in root and server):
   ```cmd
   npm install
   cd server && npm install
   ```

2. **Run Application**:
   - `npm run dev` (Frontend)
   - `cd server && npm run dev` (Backend)

See [HOW-TO-RUN.md](./HOW-TO-RUN.md) for detailed instructions.

## License

Private — All rights reserved.

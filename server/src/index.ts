import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { prisma } from './lib/prisma.js';
import { initializeSocket } from './socket.js';
import path from 'path';
import { fileURLToPath } from 'url';

const UPLOADS_PATH = path.resolve(process.cwd(), 'uploads');

// Load .env from server directory (auto-detected by dotenv)
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Socket.io
initializeSocket(httpServer);

import employeeRoutes from './routes/employees.js';
import clientRoutes from './routes/clients.js';
import visitorRoutes from './routes/visitors.js';
import messageRoutes from './routes/messages.js';
import timeEntryRoutes from './routes/time-entries.js';
import departmentRoutes from './routes/departments.js';
import seedRoutes from './routes/seed.js';
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import testNotificationRoutes from './routes/test-notification.js';
import appointmentRoutes from './routes/appointments.js';
import cascadeAdminRoutes from './routes/cascade-admin.js';
import supportRoutes from './routes/support.js';
import clientPortalRoutes from './routes/client-portal.js';
import { scheduleAllUpcomingReminders } from './helpers/appointmentReminders.js';

// CORS configuration - must be before other middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, or file://)
    if (!origin) return callback(null, true);
    
    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((s: string) => s.trim())
      : [];

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
      'https://servicepro-frontend-one.vercel.app',
      'https://service-pro-chi.vercel.app',
      'https://deskflo.pages.dev',
      'https://deskflo.netlify.app',
      ...envOrigins
    ];
    
    const allowedPatterns = [
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.pages\.dev$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.railway\.app$/,
      /^file:\/\//  // Allow file:// protocol for local HTML files
    ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches any pattern
    for (const pattern of allowedPatterns) {
      if (pattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    callback(null, true); // Allow all for development or preview
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-client-id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours preflight cache
}));

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_PATH));
console.log('Static files served from:', UPLOADS_PATH);

// Root landing route
app.get('/', (req, res) => {
    res.json({
        name: 'ServicePro Backend API',
        status: 'online',
        health: '/health',
        timestamp: new Date().toISOString()
    });
});

// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.1', timestamp: new Date().toISOString() });
});

// API Routes
console.log('Registering API routes...');
app.use('/api/employees', employeeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/time-entries', timeEntryRoutes);
console.log('Time entries routes registered at /api/time-entries');
app.use('/api/departments', departmentRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
console.log('Auth routes registered at /api/auth');
app.use('/api/notifications', notificationRoutes);
console.log('Notification routes registered at /api/notifications');
app.use('/api/test-notification', testNotificationRoutes);
console.log('Test notification route registered at /api/test-notification');
app.use('/api/appointments', appointmentRoutes);
console.log('Appointment routes registered at /api/appointments');
app.use('/api/cascade-admin', cascadeAdminRoutes);
console.log('Cascade admin routes registered at /api/cascade-admin');
app.use('/api/support', supportRoutes);
console.log('Support routes registered at /api/support');
app.use('/api/client-portal', clientPortalRoutes);
console.log('Client portal routes registered at /api/client-portal');

httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log(`📡 Listening on 0.0.0.0:${port}`);

    // Schedule 10-min reminders for all upcoming appointments
    scheduleAllUpcomingReminders();
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { prisma } from './lib/prisma.js';
import { initializeSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

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

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://servicepro-frontend-one.vercel.app',
    'https://service-pro-chi.vercel.app',
    /^https:\/\/servicepro-frontend-.*\.vercel\.app$/,
    /^https:\/\/service-pro-.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

httpServer.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log(`📡 Listening on 0.0.0.0:${port}`);
});

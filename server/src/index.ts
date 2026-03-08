import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import employeeRoutes from './routes/employees.js';
import clientRoutes from './routes/clients.js';
import visitorRoutes from './routes/visitors.js';
import messageRoutes from './routes/messages.js';
import timeEntryRoutes from './routes/time-entries.js';
import departmentRoutes from './routes/departments.js';
import seedRoutes from './routes/seed.js';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://servicepro-frontend-one.vercel.app',
    'https://servicepro-frontend-m8g0vltmc-redx927s-projects.vercel.app',
    'https://servicepro-frontend-884eo6r3s-redx927s-projects.vercel.app',
    'https://servicepro-frontend-6qjbu9vx9-redx927s-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/seed', seedRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

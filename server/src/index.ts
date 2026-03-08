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

app.use(cors());
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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

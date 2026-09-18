/**
 * CA Client Portal Routes — Phase 1 (Modules 2–6)
 * All routes prefixed with /api/client-portal
 * Does NOT modify any existing routes.
 */
import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ─── Client Authentication Routes ─────────────────────────────────────────────

// POST /client-portal/signup - Client creates account with email/password
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find client by email (get first one if multiple exist)
    const client = await prisma.client.findFirst({ where: { email } });
    if (!client) {
      return res.status(404).json({ message: 'No account found with this email. Please contact your CA firm.' });
    }

    if (client.password) {
      return res.status(409).json({ message: 'Account already has a password set. Please sign in instead.' });
    }

    // Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await prisma.client.update({
      where: { id: client.id },
      data: { password: hashedPassword, passwordSetAt: new Date() },
    });

    res.status(201).json({
      message: 'Account created successfully',
      clientId: updated.id,
      clientName: updated.name,
      token: 'temp-token', // In production, generate JWT
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /client-portal/login - Client logs in with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find client by email (get first one if multiple exist)
    const client = await prisma.client.findFirst({ where: { email } });
    if (!client) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!client.password) {
      return res.status(401).json({ message: 'Account not set up yet. Please create a password first.' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, client.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      clientId: client.id,
      clientName: client.name,
      token: 'temp-token', // In production, generate JWT
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Client Messages Routes ───────────────────────────────────────────────────

// GET /client-portal/messages - Get messages for a client
router.get('/messages', requireClient, async (req: any, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { clientId: req.clientId },
      orderBy: { timestamp: 'asc' },
      take: 50,
    });
    res.json(messages);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /client-portal/messages - Send a message from client
router.post('/messages', requireClient, async (req: any, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Message content required' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        clientId: req.clientId,
        senderId: req.clientId,
        senderType: 'client',
      },
    });

    res.status(201).json(message);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Middleware: require x-client-id header ───────────────────────────────────
function requireClient(req: any, res: any, next: any) {
  const clientId = req.headers['x-client-id'] as string;
  if (!clientId) return res.status(401).json({ error: 'Client ID required (x-client-id header)' });
  req.clientId = clientId;
  next();
}

// ─── Module 2: Client Profile ─────────────────────────────────────────────────

// GET profile
router.get('/profile', requireClient, async (req: any, res) => {
  try {
    const profile = await prisma.clientProfile.findUnique({ where: { clientId: req.clientId } });
    const client = await prisma.client.findUnique({ where: { id: req.clientId } });
    res.json({ profile, client });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST create/update profile (upsert)
router.post('/profile', requireClient, async (req: any, res) => {
  try {
    const { entityType, pan, gstin, businessName, altMobile, email, address } = req.body;
    const profile = await prisma.clientProfile.upsert({
      where: { clientId: req.clientId },
      update: { entityType, pan, gstin, businessName, altMobile, email, address, updatedAt: new Date() },
      create: { clientId: req.clientId, entityType, pan, gstin, businessName, altMobile, email, address },
    });
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH mark profile complete
router.patch('/profile/complete', requireClient, async (req: any, res) => {
  try {
    const profile = await prisma.clientProfile.update({
      where: { clientId: req.clientId },
      data: { profileComplete: true },
    });
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST accept T&C
router.post('/profile/accept-tc', requireClient, async (req: any, res) => {
  try {
    const { tcVersion, tcIp } = req.body;
    const profile = await prisma.clientProfile.upsert({
      where: { clientId: req.clientId },
      update: { tcAcceptedAt: new Date(), tcVersion, tcIp },
      create: { clientId: req.clientId, tcAcceptedAt: new Date(), tcVersion, tcIp },
    });
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Module 3: Service Dashboard ─────────────────────────────────────────────

// GET all services for client (sorted by urgency)
router.get('/services', requireClient, async (req: any, res) => {
  try {
    const services = await prisma.clientService.findMany({
      where: { clientId: req.clientId },
      include: { tasks: true },
      orderBy: { lastUpdated: 'desc' },
    });

    // Sort: overdue → waiting_on_client → in_progress → not_started → completed
    const order = ['overdue', 'waiting_on_client', 'in_progress', 'not_started', 'completed'];
    services.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

    res.json(services);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST create service (CA employee creates for client)
router.post('/services', async (req, res) => {
  try {
    const { clientId, serviceName, assignedTo, notes } = req.body;
    const service = await prisma.clientService.create({
      data: { clientId, serviceName, assignedTo, notes },
    });
    res.status(201).json(service);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update service status/progress
router.patch('/services/:id', async (req, res) => {
  try {
    const { status, progress, notes } = req.body;
    const service = await prisma.clientService.update({
      where: { id: req.params.id },
      data: { status, progress, notes, lastUpdated: new Date() },
    });
    res.json(service);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE service
router.delete('/services/:id', async (req, res) => {
  try {
    await prisma.serviceTask.deleteMany({ where: { serviceId: req.params.id } });
    await prisma.clientService.delete({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Module 3: Service Tasks (Document Checklist) ────────────────────────────

// GET tasks for a service
router.get('/services/:serviceId/tasks', async (req, res) => {
  try {
    const tasks = await prisma.serviceTask.findMany({
      where: { serviceId: req.params.serviceId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tasks);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST create task for service
router.post('/services/:serviceId/tasks', async (req, res) => {
  try {
    const { name, description, dueDate } = req.body;
    const task = await prisma.serviceTask.create({
      data: { serviceId: req.params.serviceId, name, description, dueDate: dueDate ? new Date(dueDate) : null },
    });
    res.status(201).json(task);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update task (upload file, approve, reject)
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { status, fileUrl, rejectedReason } = req.body;
    const task = await prisma.serviceTask.update({
      where: { id: req.params.id },
      data: { status, fileUrl, rejectedReason, updatedAt: new Date() },
    });

    // If all tasks for this service are uploaded/approved, auto-update service progress
    if (task.serviceId) {
      const allTasks = await prisma.serviceTask.findMany({ where: { serviceId: task.serviceId } });
      const done = allTasks.filter(t => t.status === 'approved' || t.status === 'uploaded').length;
      const progress = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;
      await prisma.clientService.update({
        where: { id: task.serviceId },
        data: { progress, lastUpdated: new Date() },
      });
    }

    res.json(task);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE task
router.delete('/tasks/:id', async (req, res) => {
  try {
    await prisma.serviceTask.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Module 4: Compliance Deadlines ──────────────────────────────────────────

// GET deadlines for client (next 3 upcoming by default)
router.get('/deadlines', requireClient, async (req: any, res) => {
  try {
    const { all } = req.query;
    const deadlines = await prisma.complianceDeadline.findMany({
      where: {
        clientId: req.clientId,
        ...(all !== 'true' && { dueDate: { gte: new Date() } }),
      },
      orderBy: { dueDate: 'asc' },
      take: all === 'true' ? 100 : 10,
    });

    // Enrich with visual state
    const enriched = deadlines.map(d => {
      const daysLeft = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const visualState =
        d.status === 'filed' ? 'grey' :
        daysLeft < 0 ? 'red' :
        daysLeft <= 7 ? 'red' :
        daysLeft <= 14 ? 'amber' : 'green';
      return { ...d, daysLeft, visualState };
    });

    res.json(enriched);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST create deadline (CA employee or auto-populate)
router.post('/deadlines', async (req, res) => {
  try {
    const { clientId, name, dueDate, isCustom, serviceId, notes } = req.body;
    const deadline = await prisma.complianceDeadline.create({
      data: { clientId, name, dueDate: new Date(dueDate), isCustom: isCustom || false, serviceId, notes },
    });
    res.status(201).json(deadline);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update deadline status
router.patch('/deadlines/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const deadline = await prisma.complianceDeadline.update({
      where: { id: req.params.id },
      data: { status, notes, updatedAt: new Date() },
    });
    res.json(deadline);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE deadline
router.delete('/deadlines/:id', async (req, res) => {
  try {
    await prisma.complianceDeadline.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deadline deleted' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST auto-populate deadlines based on entity type
router.post('/deadlines/auto-populate', async (req, res) => {
  try {
    const { clientId, entityType, financialYear } = req.body;

    const deadlinesByEntity: Record<string, { name: string; month: number; day: number }[]> = {
      'Individual': [
        { name: 'ITR Filing', month: 7, day: 31 },
        { name: 'Advance Tax Q1', month: 6, day: 15 },
        { name: 'Advance Tax Q2', month: 9, day: 15 },
        { name: 'Advance Tax Q3', month: 12, day: 15 },
        { name: 'Advance Tax Q4', month: 3, day: 15 },
      ],
      'Pvt Ltd': [
        { name: 'GSTR-1 (Monthly)', month: 0, day: 11 }, // recurring
        { name: 'GSTR-3B (Monthly)', month: 0, day: 20 },
        { name: 'TDS Return Q1', month: 7, day: 31 },
        { name: 'TDS Return Q2', month: 10, day: 31 },
        { name: 'TDS Return Q3', month: 1, day: 31 },
        { name: 'TDS Return Q4', month: 5, day: 31 },
        { name: 'MCA Annual Filing', month: 9, day: 30 },
        { name: 'ITR Filing', month: 10, day: 30 },
      ],
      'LLP': [
        { name: 'GSTR-1 (Monthly)', month: 0, day: 11 },
        { name: 'GSTR-3B (Monthly)', month: 0, day: 20 },
        { name: 'LLP Annual Return', month: 5, day: 30 },
        { name: 'ITR Filing', month: 10, day: 30 },
      ],
    };

    const templates = deadlinesByEntity[entityType] || deadlinesByEntity['Individual'];
    const year = financialYear || new Date().getFullYear();

    const created = await Promise.all(
      templates.map(t =>
        prisma.complianceDeadline.create({
          data: {
            clientId,
            name: t.name,
            dueDate: new Date(year, t.month, t.day),
            isCustom: false,
          },
        })
      )
    );

    res.status(201).json({ created: created.length, deadlines: created });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Module 5: Secure Chat (thread-based) ────────────────────────────────────
// Reuses existing Conversation + Message models
// Just adds a helper to get/create a thread by serviceId or category

// GET or create conversation thread for a service/category
router.post('/chat/thread', async (req, res) => {
  try {
    const { clientId, employeeId, serviceId, threadType } = req.body;
    // threadType: 'service' | 'document_query' | 'payment_query' | 'new_service'

    let conversation = await prisma.conversation.findFirst({
      where: { clientId, employeeId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { clientId, employeeId },
      });
    }

    res.json({ conversation, serviceId, threadType });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Module 6: Multi-Company Switcher ────────────────────────────────────────

// GET all companies accessible by this client (owner)
router.get('/companies', requireClient, async (req: any, res) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      where: { ownerId: req.clientId, isApproved: true },
    });

    // Enrich with client data
    const enriched = await Promise.all(
      companies.map(async c => {
        const client = await prisma.client.findUnique({ where: { id: c.clientId } });
        const profile = await prisma.clientProfile.findUnique({ where: { clientId: c.clientId } });
        const deadlines = await prisma.complianceDeadline.count({
          where: { clientId: c.clientId, status: 'pending', dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
        });
        return { ...c, client, profile, urgentDeadlines: deadlines };
      })
    );

    res.json(enriched);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST request to add a new company (requires CA approval)
router.post('/companies/request', requireClient, async (req: any, res) => {
  try {
    const { clientId } = req.body; // The new company's Client.id
    const existing = await prisma.companyProfile.findFirst({
      where: { ownerId: req.clientId, clientId },
    });
    if (existing) return res.status(409).json({ error: 'Company already linked or pending approval' });

    const company = await prisma.companyProfile.create({
      data: { ownerId: req.clientId, clientId, isApproved: false },
    });
    res.status(201).json({ message: 'Request submitted. Awaiting CA approval.', company });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH approve company link (CA employee action)
router.patch('/companies/:id/approve', async (req, res) => {
  try {
    const company = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    res.json(company);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE remove company link
router.delete('/companies/:id', async (req, res) => {
  try {
    await prisma.companyProfile.delete({ where: { id: req.params.id } });
    res.json({ message: 'Company link removed' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Dashboard aggregate (all modules in one call) ───────────────────────────
router.get('/dashboard', requireClient, async (req: any, res) => {
  try {
    const clientId = req.clientId;

    const [client, profile, services, deadlines, companies] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.clientProfile.findUnique({ where: { clientId } }),
      prisma.clientService.findMany({ where: { clientId }, include: { tasks: true } }),
      prisma.complianceDeadline.findMany({
        where: { clientId, dueDate: { gte: new Date() } },
        orderBy: { dueDate: 'asc' },
        take: 3,
      }),
      prisma.companyProfile.findMany({ where: { ownerId: clientId, isApproved: true } }),
    ]);

    // Enrich deadlines with days left
    const enrichedDeadlines = deadlines.map(d => {
      const daysLeft = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { ...d, daysLeft, visualState: daysLeft <= 7 ? 'red' : daysLeft <= 14 ? 'amber' : 'green' };
    });

    // Sort services by urgency
    const order = ['overdue', 'waiting_on_client', 'in_progress', 'not_started', 'completed'];
    services.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

    res.json({
      client,
      profile,
      services,
      upcomingDeadlines: enrichedDeadlines,
      companiesCount: companies.length,
      profileComplete: profile?.profileComplete ?? false,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

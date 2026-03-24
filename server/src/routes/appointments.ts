import express from 'express';
import { prisma } from '../lib/prisma.js';
import { notify } from '../helpers/notify.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { employeeId, clientId, status, date } = req.query;
    
    const where: any = {};
    if (employeeId) where.employeeId = employeeId as string;
    if (clientId) where.clientId = clientId as string;
    if (status) where.status = status as string;
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get today's appointments
router.get('/today', async (req, res) => {
  try {
    const { employeeId } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      date: {
        gte: today,
        lt: tomorrow,
      },
    };
    
    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { time: 'asc' },
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    console.log('📅 POST /appointments - body:', JSON.stringify(req.body));
    
    const {
      clientId,
      employeeId,
      contactPerson,
      date,
      time,
      duration,
      type,
      purpose,
      notes,
      meetingLink,
      location,
      phoneNumber,
    } = req.body;

    // Validation
    if (!clientId || !employeeId || !contactPerson || !date || !time || !duration || !type || !purpose) {
      const missing = { clientId, employeeId, contactPerson, date, time, duration, type, purpose };
      const missingFields = Object.entries(missing).filter(([,v]) => !v).map(([k]) => k);
      console.log('❌ Missing fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Verify clientId and employeeId exist
    const [clientExists, employeeExists] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId }, select: { id: true } }),
      prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } }),
    ]);

    if (!clientExists) {
      console.log('❌ Client not found:', clientId);
      return res.status(400).json({ error: `Client not found: ${clientId}` });
    }
    if (!employeeExists) {
      console.log('❌ Employee not found:', employeeId);
      return res.status(400).json({ error: `Employee not found: ${employeeId}` });
    }

    // Check for conflicts
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        employeeId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelled' },
      },
    });

    const hasConflict = existingAppointments.some(apt => apt.time === time);
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot already booked for this employee' });
    }

    const now = new Date();
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        employeeId,
        contactPerson,
        date: new Date(date),
        time,
        duration,
        type,
        purpose,
        notes: notes || null,
        meetingLink: meetingLink || null,
        location: location || null,
        phoneNumber: phoneNumber || null,
        updatedAt: now,
      },
    });

    console.log('✅ Appointment created:', appointment.id);

    // Send notifications to all roles (fire-and-forget, don't block response)
    const clientName = appointment.contactPerson || clientId;
    const appointmentDate = new Date(date).toLocaleDateString();
    const notifyMessage = `Appointment with ${clientName} on ${appointmentDate} at ${time} for ${purpose}`;

    Promise.all(
      ['super_admin', 'manager', 'receptionist'].map(role =>
        notify({
          role,
          type: 'appointment',
          title: 'New Appointment Scheduled',
          message: notifyMessage,
          data: { appointmentId: appointment.id },
          actionUrl: '/appointments',
          priority: 'normal',
        })
      )
    ).catch(err => console.error('⚠️ Notification error (non-fatal):', err.message));

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('❌ Error creating appointment:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Update appointment
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientId,
      employeeId,
      contactPerson,
      date,
      time,
      duration,
      type,
      purpose,
      notes,
      status,
      meetingLink,
      location,
      phoneNumber,
    } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check for conflicts if time/date/employee changed
    if ((date || time || employeeId) && status !== 'cancelled') {
      const checkDate = date ? new Date(date) : appointment.date;
      const checkTime = time || appointment.time;
      const checkEmployeeId = employeeId || appointment.employeeId;

      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          id: { not: id },
          employeeId: checkEmployeeId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: 'cancelled',
          },
        },
      });

      const hasConflict = existingAppointments.some(apt => apt.time === checkTime);
      if (hasConflict) {
        return res.status(409).json({ error: 'Time slot already booked for this employee' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(clientId && { clientId }),
        ...(employeeId && { employeeId }),
        ...(contactPerson && { contactPerson }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(duration && { duration }),
        ...(type && { type }),
        ...(purpose && { purpose }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(location !== undefined && { location }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel appointment (soft delete)
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start appointment (change status to in-progress)
router.patch('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'in-progress' },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error starting appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete appointment
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'completed' },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { prisma } from '../lib/prisma.js';
import { notify } from './notify.js';

// Track scheduled timers so we don't double-schedule
const scheduledReminders = new Set<string>();

/**
 * Schedule a 10-minute reminder for a single appointment.
 * Only schedules if the appointment is in the future (> 10 min away).
 */
export function scheduleReminder(appointment: {
  id: string;
  date: Date;
  time: string;       // e.g. "14:30"
  contactPerson: string;
  purpose: string;
}) {
  if (scheduledReminders.has(appointment.id)) return;

  const [hours, minutes] = appointment.time.split(':').map(Number);
  const appointmentDateTime = new Date(appointment.date);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const reminderTime = new Date(appointmentDateTime.getTime() - 10 * 60 * 1000);
  const msUntilReminder = reminderTime.getTime() - Date.now();

  // Only schedule if reminder is still in the future
  if (msUntilReminder <= 0) return;

  // Cap at ~24 days to avoid Node.js timer overflow (max safe setTimeout ~2^31 ms)
  if (msUntilReminder > 2_000_000_000) return;

  scheduledReminders.add(appointment.id);

  setTimeout(async () => {
    scheduledReminders.delete(appointment.id);
    try {
      // Confirm appointment still exists and isn't cancelled
      const apt = await prisma.appointment.findUnique({
        where: { id: appointment.id },
        select: { status: true },
      });
      if (!apt || apt.status === 'cancelled') return;

      await notify({
        role: 'receptionist',
        type: 'appointment',
        title: 'Upcoming Appointment in 10 Minutes',
        message: `Reminder: Appointment with ${appointment.contactPerson} at ${appointment.time} for ${appointment.purpose} starts in 10 minutes.`,
        data: { appointmentId: appointment.id },
        actionUrl: '/appointments',
        priority: 'high',
      });

      console.log(`⏰ 10-min reminder sent for appointment ${appointment.id}`);
    } catch (err: any) {
      console.error('⚠️ Failed to send appointment reminder:', err.message);
    }
  }, msUntilReminder);

  console.log(
    `⏰ Reminder scheduled for appointment ${appointment.id} in ${Math.round(msUntilReminder / 60000)} min`
  );
}

/**
 * On server startup, reschedule reminders for all upcoming appointments
 * that haven't been cancelled or completed.
 */
export async function scheduleAllUpcomingReminders() {
  try {
    const now = new Date();
    const upcoming = await prisma.appointment.findMany({
      where: {
        date: { gte: now },
        status: { notIn: ['cancelled', 'completed'] },
      },
      select: {
        id: true,
        date: true,
        time: true,
        contactPerson: true,
        purpose: true,
      },
    });

    for (const apt of upcoming) {
      scheduleReminder(apt);
    }

    console.log(`📅 Scheduled reminders for ${upcoming.length} upcoming appointments`);
  } catch (err: any) {
    console.error('⚠️ Failed to schedule startup reminders:', err.message);
  }
}

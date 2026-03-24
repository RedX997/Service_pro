-- Add Appointments Table
-- ⚠️ SAFE MIGRATION - ONLY ADDS NEW TABLE, DOES NOT MODIFY OR DELETE EXISTING DATA
-- This migration creates the appointments table for scheduling meetings
-- All existing tables (Client, Employee, User, etc.) remain untouched

CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "meetingLink" TEXT,
    "location" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Appointment_clientId_idx" ON "Appointment"("clientId");
CREATE INDEX IF NOT EXISTS "Appointment_employeeId_idx" ON "Appointment"("employeeId");
CREATE INDEX IF NOT EXISTS "Appointment_date_idx" ON "Appointment"("date");
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

-- Add comments
COMMENT ON TABLE "Appointment" IS 'Stores appointment/meeting schedules between employees and clients';
COMMENT ON COLUMN "Appointment"."type" IS 'Meeting type: in-person, video, or phone';
COMMENT ON COLUMN "Appointment"."status" IS 'Appointment status: scheduled, in-progress, completed, or cancelled';
COMMENT ON COLUMN "Appointment"."time" IS 'Time in 12-hour format (e.g., 10:00 AM)';
COMMENT ON COLUMN "Appointment"."duration" IS 'Duration in format like 1h, 30m, 1h 30m';

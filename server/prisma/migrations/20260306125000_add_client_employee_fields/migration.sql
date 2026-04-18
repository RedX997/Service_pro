-- Add missing fields to Client table
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "services" TEXT[] DEFAULT '{}';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "assignedEmployee" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "lastContact" TIMESTAMP(3);

-- Add missing field to Employee table
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "mobile" TEXT;

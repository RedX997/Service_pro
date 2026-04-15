-- Migration: Add multi-department support for Employee
-- Run this SQL directly on your PostgreSQL database (Supabase / Neon / etc.)
-- Generated: 2026-04-15

-- 1. Add `departments` TEXT[] array column to Employee table (backward-compat default: empty)
ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS departments TEXT[] NOT NULL DEFAULT '{}';

-- 2. Backfill `departments` from existing `department` field (single → array)
UPDATE "Employee"
SET departments = ARRAY[department]
WHERE department IS NOT NULL AND department <> '' AND departments = '{}';

-- 3. Create the junction table for many-to-many Employee ↔ Department
CREATE TABLE IF NOT EXISTS employee_departments (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "employeeId"  TEXT        NOT NULL,
  "departmentId" TEXT       NOT NULL,
  "assignedAt"  TIMESTAMP   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_ed_employee
    FOREIGN KEY ("employeeId") REFERENCES "Employee"(id) ON DELETE CASCADE,

  CONSTRAINT fk_ed_department
    FOREIGN KEY ("departmentId") REFERENCES "Department"(id) ON DELETE CASCADE,

  CONSTRAINT unique_employee_department
    UNIQUE ("employeeId", "departmentId")
);

CREATE INDEX IF NOT EXISTS idx_ed_employee   ON employee_departments ("employeeId");
CREATE INDEX IF NOT EXISTS idx_ed_department ON employee_departments ("departmentId");

-- 4. Backfill junction rows from existing single-department assignments
INSERT INTO employee_departments ("employeeId", "departmentId")
SELECT e.id AS "employeeId", d.id AS "departmentId"
FROM "Employee" e
JOIN "Department" d ON d.name = e.department
WHERE e.department IS NOT NULL AND e.department <> ''
ON CONFLICT DO NOTHING;

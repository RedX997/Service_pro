-- Client Activity Log Migration
-- Run this in your Render PostgreSQL database

CREATE TABLE IF NOT EXISTS client_activity_logs (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "performedBy" INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT client_activity_logs_clientId_fkey 
    FOREIGN KEY ("clientId") REFERENCES clients(id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT client_activity_logs_performedBy_fkey 
    FOREIGN KEY ("performedBy") REFERENCES users(id) 
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS client_activity_logs_clientId_idx ON client_activity_logs("clientId");
CREATE INDEX IF NOT EXISTS client_activity_logs_performedBy_idx ON client_activity_logs("performedBy");
CREATE INDEX IF NOT EXISTS client_activity_logs_action_idx ON client_activity_logs(action);
CREATE INDEX IF NOT EXISTS client_activity_logs_createdAt_idx ON client_activity_logs("createdAt");

-- Verify the table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'client_activity_logs';

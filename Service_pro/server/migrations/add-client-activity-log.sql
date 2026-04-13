-- Create client_activity_logs table
CREATE TABLE IF NOT EXISTS client_activity_logs (
    id TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "performedBy" INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_activity_client FOREIGN KEY ("clientId") 
        REFERENCES "Client"(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_activity_user FOREIGN KEY ("performedBy") 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_clientId ON client_activity_logs("clientId");
CREATE INDEX IF NOT EXISTS idx_activity_performedBy ON client_activity_logs("performedBy");
CREATE INDEX IF NOT EXISTS idx_activity_action ON client_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_createdAt ON client_activity_logs("createdAt");

-- Add comments
COMMENT ON TABLE client_activity_logs IS 'Audit trail for all client-related activities';
COMMENT ON COLUMN client_activity_logs.action IS 'Action type: CLIENT_CREATED, CLIENT_UPDATED, STATUS_CHANGED, EMPLOYEE_ASSIGNED, EMPLOYEE_UNASSIGNED, SERVICE_ADDED, SERVICE_REMOVED, VISITOR_ENTERED, VISITOR_EXITED, MESSAGE_SENT, DOCUMENT_UPLOADED, CLIENT_DELETED';
COMMENT ON COLUMN client_activity_logs.metadata IS 'JSON snapshot of what changed (old/new values, additional context)';

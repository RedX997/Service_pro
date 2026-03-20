-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT false,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    "actionUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6),
    
    CONSTRAINT fk_notification_user FOREIGN KEY ("userId") 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications("createdAt");

-- Add comment to table
COMMENT ON TABLE notifications IS 'Real-time notifications for users';
COMMENT ON COLUMN notifications.type IS 'Notification type: visitor, message, appointment, timer, task, system';
COMMENT ON COLUMN notifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN notifications.data IS 'Additional metadata in JSON format';

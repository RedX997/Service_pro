-- Migration: Add Real-time Messaging System
-- Date: 2026-03-23
-- Description: Enhance messaging with conversations, delivery status, reactions, and online status

-- Create Conversation table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "lastMessageId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create UserStatus table for online/offline tracking
CREATE TABLE IF NOT EXISTS "UserStatus" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "userType" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socketId" TEXT
);

-- Add new columns to Message table (if they don't exist)
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "conversationId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "isDelivered" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "replyToId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "reactions" JSONB;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);

-- Create indexes for Conversation
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_clientId_employeeId_key" ON "Conversation"("clientId", "employeeId");
CREATE INDEX IF NOT EXISTS "Conversation_clientId_idx" ON "Conversation"("clientId");
CREATE INDEX IF NOT EXISTS "Conversation_employeeId_idx" ON "Conversation"("employeeId");
CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- Create indexes for UserStatus
CREATE INDEX IF NOT EXISTS "UserStatus_isOnline_idx" ON "UserStatus"("isOnline");
CREATE INDEX IF NOT EXISTS "UserStatus_userType_idx" ON "UserStatus"("userType");

-- Create indexes for Message
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_timestamp_idx" ON "Message"("timestamp");

-- Migrate existing messages to conversations
-- Create conversations for existing messages
INSERT INTO "Conversation" ("id", "clientId", "employeeId", "lastMessageAt", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    "clientId",
    "senderId",
    MAX("timestamp"),
    MIN("createdAt"),
    NOW()
FROM "Message"
WHERE "senderType" = 'employee'
GROUP BY "clientId", "senderId"
ON CONFLICT DO NOTHING;

-- Update existing messages with conversationId
UPDATE "Message" m
SET "conversationId" = c."id"
FROM "Conversation" c
WHERE m."clientId" = c."clientId" 
  AND (m."senderId" = c."employeeId" OR m."senderType" = 'client');

-- Make conversationId NOT NULL after migration
-- ALTER TABLE "Message" ALTER COLUMN "conversationId" SET NOT NULL;

COMMENT ON TABLE "Conversation" IS 'Stores conversation threads between employees and clients';
COMMENT ON TABLE "UserStatus" IS 'Tracks online/offline status of users for real-time presence';
COMMENT ON COLUMN "Message"."isDelivered" IS 'Message delivered to recipient (double checkmark)';
COMMENT ON COLUMN "Message"."isRead" IS 'Message read by recipient (blue checkmark)';
COMMENT ON COLUMN "Message"."reactions" IS 'JSON object storing emoji reactions: {userId: emoji}';
COMMENT ON COLUMN "Message"."replyToId" IS 'ID of message being replied to (quoted message)';

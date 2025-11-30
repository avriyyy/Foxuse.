-- Add lastMessageId column to agent_config table
ALTER TABLE agent_config ADD COLUMN IF NOT EXISTS "lastMessageId" INTEGER;

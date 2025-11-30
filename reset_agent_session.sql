-- Reset agent session for new credentials
UPDATE agent_config 
SET "sessionString" = NULL, 
    "lastMessageId" = NULL,
    "isActive" = false
WHERE id IS NOT NULL;

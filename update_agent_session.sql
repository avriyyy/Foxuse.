-- Update agent session string
UPDATE agent_config 
SET "sessionString" = '1BQANOTEuMTA4LjU2LjE1OAG7SpzllPCpk3HFcR5YaSg0qhWOY6z5KJVjhFs2MWl0OmRbOQFzKVixcm2i90WaOEZTWQiPOG16UhIEW2sGPmZEwaUfQG244TZ3bPmFbwDeJGIrCfHRoiaxgeaOCUQel2rmPyRTLM+/Ub0b9D93l3DwCvd6j+WixCjSrp0pgi7NNb00sDWQ28SQrPGGkiUILMikHrvz4PCgIAJnVHFCI/aI6md4G60jcK9RlXO7hEgxzgOoF2DC63SoazD0BwgH04iZNUcekAO5mmmhkhNWVeREaa9VyL1b46FhJg3ZZFWVOzmGR/XN8tqUbbLv891FS6qHBOhuorzdeZlmt1gpUJb01A==',
    "isActive" = true,
    "telegramApiId" = '30386736',
    "telegramApiHash" = 'b858476b707a3d364630f8ade488133f',
    "telegramPhone" = '+62895335022376',
    "targetGroup" = '@airdropfind',
    "llmProvider" = 'OPENROUTER_GROK',
    "llmApiKey" = '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'
WHERE id IS NOT NULL;

-- If no record exists, insert new one
INSERT INTO agent_config (
    id,
    "telegramApiId",
    "telegramApiHash",
    "telegramPhone",
    "targetGroup",
    "llmProvider",
    "llmApiKey",
    "sessionString",
    "isActive",
    "updatedAt"
)
SELECT 
    gen_random_uuid(),
    '30386736',
    'b858476b707a3d364630f8ade488133f',
    '+62895335022376',
    '@airdropfind',
    'OPENROUTER_GROK',
    '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',
    '1BQANOTEuMTA4LjU2LjE1OAG7SpzllPCpk3HFcR5YaSg0qhWOY6z5KJVjhFs2MWl0OmRbOQFzKVixcm2i90WaOEZTWQiPOG16UhIEW2sGPmZEwaUfQG244TZ3bPmFbwDeJGIrCfHRoiaxgeaOCUQel2rmPyRTLM+/Ub0b9D93l3DwCvd6j+WixCjSrp0pgi7NNb00sDWQ28SQrPGGkiUILMikHrvz4PCgIAJnVHFCI/aI6md4G60jcK9RlXO7hEgxzgOoF2DC63SoazD0BwgH04iZNUcekAO5mmmhkhNWVeREaa9VyL1b46FhJg3ZZFWVOzmGR/XN8tqUbbLv891FS6qHBOhuorzdeZlmt1gpUJb01A==',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM agent_config LIMIT 1);

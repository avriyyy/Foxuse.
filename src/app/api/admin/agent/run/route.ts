import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

// Helper to log to DB
async function log(message: string, level: 'INFO' | 'ERROR' | 'SUCCESS' = 'INFO') {
    const timestamp = new Date().toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`[AGENT] ${logMessage}`);
    try {
        // @ts-ignore
        await prisma.agentLog.create({
            data: { message: logMessage, level }
        });
    } catch (e) {
        console.error("Failed to write log to DB", e);
    }
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Vercel Cron calls GET by default
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Reuse the logic (simulate POST START)
    return POST(new Request(req.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'START' })
    }));
}

const AGENT_CONFIG = {
    apiId: 30386736,
    apiHash: "b858476b707a3d364630f8ade488133f",
    phone: "+62895335022376",
    targetGroup: "@airdropfind",
    llmProvider: "OPENROUTER_GROK",
    llmApiKey: "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"
};

export async function POST(req: Request) {
    try {
        // Check if triggered by Vercel Cron
        const authHeader = req.headers.get('authorization');
        const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
        
        let body: any = {};
        try {
            body = await req.json();
        } catch (e) {
            if (!isCron) throw e;
        }

        const { action = isCron ? 'START' : undefined, phoneCode, password } = body; 

        // Get session from DB
        // @ts-ignore
        const dbConfig = await prisma.agentConfig.findFirst();
        
        // Use hardcoded config + DB session
        const config = {
            ...AGENT_CONFIG,
            telegramApiId: AGENT_CONFIG.apiId,
            telegramApiHash: AGENT_CONFIG.apiHash,
            telegramPhone: AGENT_CONFIG.phone,
            sessionString: dbConfig?.sessionString || "",
            id: dbConfig?.id
        };

        const apiId = config.apiId;
        const apiHash = config.apiHash;
        const stringSession = new StringSession(config.sessionString || "");

        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        if (action === 'START') {
            await log("Initializing Telegram Client...");
            
            if (config.sessionString) {
                await client.connect();
                await log("Connected with existing session.");
                
                await processMessages(client, config);
                
                return NextResponse.json({ status: "RUNNING", message: "Agent ran successfully.", version: "2.0.0-context-chain" });
            } 
            
            await client.connect();
            
            try {
                const { phoneCodeHash } = await client.sendCode(
                    {
                        apiId,
                        apiHash,
                    },
                    config.telegramPhone
                );
                
                await log("OTP Code sent to Telegram app.");
                return NextResponse.json({ status: "NEEDS_CODE", phoneCodeHash });
            } catch (e: any) {
                await log(`Login failed: ${e.message}`, 'ERROR');
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        }

        if (action === 'SUBMIT_CODE') {
            if (!body.phoneCodeHash || !phoneCode) {
                return NextResponse.json({ error: "Missing code or hash" }, { status: 400 });
            }

            try {
                await client.connect();
                await client.invoke(
                    new Api.auth.SignIn({
                        phoneNumber: config.telegramPhone,
                        phoneCodeHash: body.phoneCodeHash,
                        phoneCode: phoneCode,
                    })
                );
                
                const session = client.session.save() as unknown as string;
                // @ts-ignore
                await prisma.agentConfig.update({
                    where: { id: config.id },
                    data: { sessionString: session, isActive: true }
                });

                await log("Login successful! Session saved.", 'SUCCESS');
                return NextResponse.json({ status: "LOGGED_IN" });
            } catch (e: any) {
                if (e.message.includes("SESSION_PASSWORD_NEEDED")) {
                     return NextResponse.json({ status: "NEEDS_PASSWORD" });
                }
                await log(`OTP Verification failed: ${e.message}`, 'ERROR');
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        }
        
        if (action === 'SUBMIT_PASSWORD') {
             try {
                await client.connect();
                await (client as any).signIn({
                    password: password,
                    phoneNumber: config.telegramPhone,
                    phoneCodeHash: body.phoneCodeHash,
                    phoneCode: phoneCode,
                });
                
                const session = client.session.save() as unknown as string;
                // @ts-ignore
                await prisma.agentConfig.update({
                    where: { id: config.id },
                    data: { sessionString: session, isActive: true }
                });
                await log("Login successful (2FA)! Session saved.", 'SUCCESS');
                 return NextResponse.json({ status: "LOGGED_IN" });
             } catch (e: any) {
                 await log(`2FA Verification failed: ${e.message}`, 'ERROR');
                 return NextResponse.json({ error: e.message }, { status: 500 });
             }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Agent Error:", error);
        await log(`Critical Error: ${error.message}`, 'ERROR');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function processMessages(client: TelegramClient, config: any) {
    await log(`Starting monitoring of ${config.targetGroup} (New messages only)...`);
    
    let entity;
    try {
        entity = await client.getEntity(config.targetGroup);
    } catch (e) {
        await log(`Failed to find group: ${config.targetGroup}`, 'ERROR');
        return;
    }

    let cycles = 0;
    const MAX_CYCLES = 1;

    while (cycles < MAX_CYCLES) {
        try {
            // @ts-ignore
            const currentConfig = await prisma.agentConfig.findUnique({ where: { id: config.id } });
            if (!currentConfig || !currentConfig.isActive) {
                await log("Agent stopped by user.");
                break;
            }

            const lastMessageId = currentConfig.lastMessageId || 0;
            
            let messages;
            if (lastMessageId > 0) {
                messages = await client.getMessages(entity, { 
                    minId: lastMessageId,
                    limit: 100
                });
                await log(`Fetching new messages since ID: ${lastMessageId}`);
            } else {
                messages = await client.getMessages(entity, { limit: 30 });
                await log(`First run - initializing with last 30 messages`);
            }

            if (messages.length === 0) {
                await log("No new messages to process.");
                cycles++;
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }

            await log(`Found ${messages.length} new message(s)`);
            
            let latestMessageId = lastMessageId;

            for (const message of messages) {
                if (message.message) {
                    if (message.id > latestMessageId) {
                        latestMessageId = message.id;
                    }

                    let messageText = message.message;
                    let contextChain: string[] = [];
                    
                    // Build complete context chain for replies
                    if (message.replyTo) {
                        try {
                            await log(`Building context chain for message ID: ${message.id}`);
                            
                            let currentMsg = message;
                            let depth = 0;
                            const MAX_DEPTH = 10;
                            
                            while (currentMsg.replyTo && depth < MAX_DEPTH) {
                                const replyMsg = await currentMsg.getReplyMessage();
                                if (replyMsg && replyMsg.message) {
                                    contextChain.unshift(replyMsg.message);
                                    currentMsg = replyMsg;
                                    depth++;
                                } else {
                                    break;
                                }
                            }
                            
                            if (contextChain.length > 0) {
                                const contextText = contextChain.map((msg, idx) => 
                                    `[Context Level ${idx + 1}]: ${msg}`
                                ).join('\n\n');
                                
                                messageText = `${contextText}\n\n[Current Message]: ${message.message}`;
                                await log(`Built context chain with ${contextChain.length} level(s)`);
                            }
                        } catch (e) {
                            console.warn("Failed to build context chain", e);
                        }
                    }

                    await log(`Analyzing: ${message.message.substring(0, 50)}...`);
                    
                    const analysis = await analyzeWithLLM(messageText, config);
                    
                    if (!analysis) {
                        await log(`[SKIP] Message classified as IRRELEVANT or LLM error`);
                        continue;
                    }
                    
                    await log(`[LLM] Classified as: ${analysis.type}`);
                    
                    if (analysis) {
                        if (analysis.type === 'NEW_AIRDROP') {
                            const targetName = analysis.data.name.trim();
                            await log(`[CHECK] Looking for existing: "${targetName}"`);
                            
                            // @ts-ignore
                            const existing = await prisma.airdrop.findFirst({
                                where: { name: { equals: targetName, mode: 'insensitive' } }
                            });

                            if (!existing) {
                                // @ts-ignore
                                await prisma.airdrop.create({
                                    data: {
                                        name: targetName,
                                        description: analysis.data.description,
                                        category: analysis.data.category,
                                        difficulty: analysis.data.difficulty,
                                        potential: analysis.data.potential,
                                        tasks: analysis.data.tasks || [],
                                    }
                                });
                                await log(`[NEW AIRDROP] ✅ Created: ${targetName}`, 'SUCCESS');
                            } else {
                                await log(`[SKIP] Airdrop "${targetName}" already exists (matched: "${existing.name}")`);
                            }
                        } else if (analysis.type === 'NEW_TASK') {
                            const targetName = analysis.data.targetAirdropName.trim();
                            // @ts-ignore
                            const existing = await prisma.airdrop.findFirst({
                                where: { name: { equals: targetName, mode: 'insensitive' } }
                            });

                            if (existing) {
                                const currentTasks = (existing.tasks as any[]) || [];
                                const newTasks = analysis.data.tasks || [];
                                const uniqueNewTasks = newTasks.filter((nt: any) => 
                                    !currentTasks.some((ct: any) => ct.url === nt.url || ct.title === nt.title)
                                );

                                if (uniqueNewTasks.length > 0) {
                                    const updatedTasks = [...currentTasks, ...uniqueNewTasks];
                                    // @ts-ignore
                                    await prisma.airdrop.update({
                                        where: { id: existing.id },
                                        data: { tasks: updatedTasks }
                                    });
                                    await log(`[UPDATE] Added ${uniqueNewTasks.length} tasks to ${existing.name}`, 'SUCCESS');
                                } else {
                                    await log(`[SKIP] No new tasks for ${existing.name}`);
                                }
                            } else {
                                await log(`[SKIP] Airdrop ${targetName} not found`);
                            }
                        }
                    }
                }
            }
            
            if (latestMessageId > lastMessageId) {
                try {
                    // @ts-ignore
                    await prisma.agentConfig.update({
                        where: { id: config.id },
                        data: { lastMessageId: latestMessageId }
                    });
                    await log(`Updated last message ID to: ${latestMessageId}`, 'SUCCESS');
                } catch (updateError: any) {
                    // Field might not exist yet in database
                    await log(`Note: Could not update lastMessageId (field may not exist in DB yet)`, 'INFO');
                    console.warn("lastMessageId update failed:", updateError.message);
                }
            }
            
            cycles++;
            await new Promise(resolve => setTimeout(resolve, 10000));
        } catch (e: any) {
            await log(`Error: ${e.message}`, 'ERROR');
            break;
        }
    }
}

async function analyzeWithLLM(text: string, config: any) {
    if (config.llmProvider === 'OPENROUTER_GROK') {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.llmApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "x-ai/grok-beta",
                    "messages": [
                        {
                            "role": "system",
                            "content": `You are an expert airdrop hunter agent. Analyze Telegram messages.
                            
                            Determine TYPE:
                            1. 'NEW_AIRDROP': New airdrop announcement
                            2. 'NEW_TASK': Update adding tasks to existing airdrop
                            3. 'IRRELEVANT': Not airdrop related
                            
                            Return JSON ONLY.
                            
                            NEW_AIRDROP format:
                            {
                                "type": "NEW_AIRDROP",
                                "data": {
                                    "name": "Project Name",
                                    "description": "Description",
                                    "category": "DeFi"|"NFT"|"L2"|"GameFi"|"Infrastructure",
                                    "difficulty": "Easy"|"Medium"|"Hard",
                                    "potential": "Low"|"Medium"|"High",
                                    "tasks": [{"id": "uuid", "title": "Task", "url": "URL", "completed": false}]
                                }
                            }
                            
                            NEW_TASK format:
                            {
                                "type": "NEW_TASK",
                                "data": {
                                    "targetAirdropName": "Project Name",
                                    "tasks": [{"id": "uuid", "title": "Task", "url": "URL", "completed": false}]
                                }
                            }
                            
                            IRRELEVANT format:
                            { "type": "IRRELEVANT" }`
                        },
                        {
                            "role": "user",
                            "content": text
                        }
                    ]
                })
            });
            
            const data = await response.json();
            
            // Log raw LLM response for debugging
            if (!data.choices || !data.choices[0]) {
                await log(`[LLM ERROR] Invalid response structure: ${JSON.stringify(data).substring(0, 200)}`, 'ERROR');
                return null;
            }
            
            const content = data.choices[0].message.content;
            await log(`[LLM RAW] ${content.substring(0, 150)}...`);
            
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.type === 'IRRELEVANT') {
                await log(`[LLM] ❌ Classified as IRRELEVANT - Message not recognized as airdrop`);
                return null;
            }
            
            return parsed;

        } catch (e: any) {
            await log(`[LLM ERROR] ${e.message}`, 'ERROR');
            console.error("LLM Error", e);
            return null;
        }
    }
    return null;
}

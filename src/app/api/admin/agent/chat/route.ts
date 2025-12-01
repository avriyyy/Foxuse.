import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export const dynamic = 'force-dynamic';

// Helper to log
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
    console.log(`[CHAT-AGENT] ${logMessage}`);
    try {
        // @ts-ignore
        await prisma.agentLog.create({
            data: { message: `[CHAT] ${logMessage}`, level }
        });
    } catch (e) {
        console.error("Failed to write log to DB", e);
    }
}

// Analyze message with LLM
async function analyzeWithLLM(text: string, config: any) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.llmApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert airdrop hunter agent. Analyze Telegram messages.
                        
                        Determine TYPE:
                        1. 'NEW_AIRDROP': New airdrop announcement, waitlist, or testnet
                        2. 'NEW_TASK': Update adding tasks/quests to existing airdrop
                        3. 'IRRELEVANT': Not airdrop related (spam, chat, general news)
                        
                        Return JSON ONLY.
                        
                        NEW_AIRDROP format:
                        {
                            "type": "NEW_AIRDROP",
                            "data": {
                                "name": "Project Name",
                                "description": "Description (mention if Waitlist/Testnet)",
                                "category": "DeFi"|"NFT"|"L2"|"GameFi"|"Infrastructure"|"Wallet",
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
        
        if (!data.choices || !data.choices[0]) {
            return null;
        }
        
        const content = data.choices[0].message.content;
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.type === 'IRRELEVANT') return null;
        return parsed;

    } catch (e: any) {
        await log(`[LLM ERROR] ${e.message}`, 'ERROR');
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { airdropNames } = body; // Array of airdrop names to search

        if (!airdropNames || !Array.isArray(airdropNames)) {
            return NextResponse.json({ error: 'airdropNames array required' }, { status: 400 });
        }

        await log(`Searching for ${airdropNames.length} airdrop(s): ${airdropNames.join(', ')}`);

        // Get agent config
        // @ts-ignore
        const config = await prisma.agentConfig.findFirst();
        
        if (!config || !config.sessionString) {
            await log('No agent session found', 'ERROR');
            return NextResponse.json({ error: 'Agent not configured' }, { status: 500 });
        }

        // Connect to Telegram
        const stringSession = new StringSession(config.sessionString);
        const client = new TelegramClient(
            stringSession, 
            parseInt(config.telegramApiId), 
            config.telegramApiHash, 
            { connectionRetries: 5 }
        );

        await client.connect();
        await log('Connected to Telegram');

        const entity = await client.getEntity(config.targetGroup);
        await log(`Searching in group: ${config.targetGroup}`);

        const results: any[] = [];

        // Search for each airdrop name
        for (const airdropName of airdropNames) {
            await log(`Searching for: "${airdropName}"`);
            
            // Search messages containing the airdrop name
            const messages = await client.getMessages(entity, { 
                limit: 100,
                search: airdropName 
            });

            await log(`Found ${messages.length} message(s) for "${airdropName}"`);

            const matchedMessages = messages
                .filter(msg => msg.message && msg.message.toLowerCase().includes(airdropName.toLowerCase()))
                .slice(0, 5); // Limit to 5 most recent

            const processedMessages: any[] = [];
            let createdCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;

            // Analyze each message with LLM
            for (const msg of matchedMessages) {
                await log(`Analyzing message ID: ${msg.id}`);
                
                const analysis = await analyzeWithLLM(msg.message, config);
                
                let action = 'SKIPPED';
                let reason = 'IRRELEVANT';

                if (analysis) {
                    if (analysis.type === 'NEW_AIRDROP') {
                        const targetName = analysis.data.name.trim();
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
                            await log(`✅ Created airdrop: ${targetName}`, 'SUCCESS');
                            action = 'CREATED';
                            reason = 'NEW_AIRDROP';
                            createdCount++;
                        } else {
                            await log(`⏭️ Airdrop "${targetName}" already exists`);
                            action = 'SKIPPED';
                            reason = 'ALREADY_EXISTS';
                            skippedCount++;
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
                                await log(`✅ Added ${uniqueNewTasks.length} tasks to ${existing.name}`, 'SUCCESS');
                                action = 'UPDATED';
                                reason = 'NEW_TASKS';
                                updatedCount++;
                            } else {
                                await log(`⏭️ No new tasks for ${existing.name}`);
                                action = 'SKIPPED';
                                reason = 'NO_NEW_TASKS';
                                skippedCount++;
                            }
                        } else {
                            await log(`⚠️ Airdrop ${targetName} not found for task update`);
                            action = 'SKIPPED';
                            reason = 'AIRDROP_NOT_FOUND';
                            skippedCount++;
                        }
                    }
                } else {
                    skippedCount++;
                }

                processedMessages.push({
                    id: msg.id,
                    date: msg.date,
                    text: msg.message,
                    hasReply: !!msg.replyTo,
                    action,
                    reason
                });
            }

            results.push({
                airdropName,
                found: matchedMessages.length > 0,
                messageCount: matchedMessages.length,
                messages: processedMessages,
                stats: {
                    created: createdCount,
                    updated: updatedCount,
                    skipped: skippedCount
                }
            });
        }

        await client.disconnect();
        await log(`Search complete. Found results for ${results.filter(r => r.found).length}/${airdropNames.length} airdrops`, 'SUCCESS');

        return NextResponse.json({ 
            success: true,
            results,
            summary: {
                total: airdropNames.length,
                found: results.filter(r => r.found).length,
                notFound: results.filter(r => !r.found).length
            }
        });

    } catch (error: any) {
        console.error("Chat Agent Error:", error);
        await log(`Error: ${error.message}`, 'ERROR');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

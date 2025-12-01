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
            // Note: Telegram doesn't have built-in search API, so we fetch recent messages
            const messages = await client.getMessages(entity, { 
                limit: 100,
                search: airdropName // This will filter messages containing the keyword
            });

            await log(`Found ${messages.length} message(s) for "${airdropName}"`);

            const matchedMessages = messages
                .filter(msg => msg.message && msg.message.toLowerCase().includes(airdropName.toLowerCase()))
                .slice(0, 5) // Limit to 5 most recent
                .map(msg => ({
                    id: msg.id,
                    date: msg.date,
                    text: msg.message,
                    hasReply: !!msg.replyTo
                }));

            results.push({
                airdropName,
                found: matchedMessages.length > 0,
                messageCount: matchedMessages.length,
                messages: matchedMessages
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

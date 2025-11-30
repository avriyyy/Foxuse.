import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const config = await (prisma as any).agentConfig.findFirst();
        return NextResponse.json({ config });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { telegramApiId, telegramApiHash, telegramPhone, targetGroup, llmProvider, llmApiKey } = body;

        // Check if config exists
        const existingConfig = await (prisma as any).agentConfig.findFirst();

        let config;
        if (existingConfig) {
            config = await (prisma as any).agentConfig.update({
                where: { id: existingConfig.id },
                data: {
                    telegramApiId,
                    telegramApiHash,
                    telegramPhone,
                    targetGroup,
                    llmProvider,
                    llmApiKey
                }
            });
        } else {
            config = await (prisma as any).agentConfig.create({
                data: {
                    telegramApiId,
                    telegramApiHash,
                    telegramPhone,
                    targetGroup,
                    llmProvider,
                    llmApiKey
                }
            });
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("Save config error:", error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}

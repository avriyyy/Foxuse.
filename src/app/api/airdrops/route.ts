import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/airdrops - Fetch all airdrops
export async function GET() {
    try {
        const airdrops = await prisma.airdrop.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ airdrops }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch airdrops' },
            { status: 500 }
        );
    }
}

// POST /api/airdrops - Create new airdrop (admin only)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, category, difficulty, potential, tasks, walletAddress } = body;

        // Admin check
        const ADMIN_WALLET = "0xed5a458cbf7dca9fabab9b318b8b5e4fcc055f2b";

        if (walletAddress?.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Validate required fields
        if (!name || !description || !category || !difficulty || !potential) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const airdrop = await prisma.airdrop.create({
            data: {
                name,
                description,
                category,
                difficulty,
                potential,
                tasks: tasks || []
            }
        });

        return NextResponse.json({ airdrop }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to create airdrop' },
            { status: 500 }
        );
    }
}

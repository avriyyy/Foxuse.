import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/airdrops/[id] - Fetch single airdrop
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const airdrop = await prisma.airdrop.findUnique({
            where: { id }
        });

        if (!airdrop) {
            return NextResponse.json(
                { error: 'Airdrop not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ airdrop }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch airdrop' },
            { status: 500 }
        );
    }
}

// PUT /api/airdrops/[id] - Update airdrop (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, category, difficulty, potential, tasks, walletAddress } = body;

        // Admin check
        const ADMIN_WALLET = "0x73F4a29D4d55F3bf090E584eD8D549DC02C68881";
        const DEV_MODE = process.env.DEV_MODE === 'true';

        if (!DEV_MODE && walletAddress?.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const airdrop = await prisma.airdrop.update({
            where: { id },
            data: {
                name,
                description,
                category,
                difficulty,
                potential,
                tasks: tasks || [],
            }
        });

        return NextResponse.json({ airdrop }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { error: 'Airdrop not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update airdrop' },
            { status: 500 }
        );
    }
}

// DELETE /api/airdrops/[id] - Delete airdrop (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { walletAddress } = body;

        // Admin check
        const ADMIN_WALLET = "0x73F4a29D4d55F3bf090E584eD8D549DC02C68881";
        const DEV_MODE = process.env.DEV_MODE === 'true';

        if (!DEV_MODE && walletAddress?.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        await prisma.airdrop.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Airdrop deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { error: 'Airdrop not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to delete airdrop' },
            { status: 500 }
        );
    }
}

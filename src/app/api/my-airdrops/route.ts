import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/my-airdrops - Fetch saved airdrops for a wallet
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        const userAirdrops = await prisma.userAirdrop.findMany({
            where: {
                wallet: {
                    equals: wallet,
                    mode: 'insensitive' // Case insensitive search
                }
            },
            include: {
                airdrop: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data to return list of airdrops
        const airdrops = userAirdrops.map(ua => ua.airdrop);

        return NextResponse.json({ airdrops }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch my airdrops' },
            { status: 500 }
        );
    }
}

// POST /api/my-airdrops - Save an airdrop for a wallet
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { wallet, airdropId } = body;

        if (!wallet || !airdropId) {
            return NextResponse.json(
                { error: 'Wallet and airdropId are required' },
                { status: 400 }
            );
        }

        // Check if already saved
        const existing = await prisma.userAirdrop.findFirst({
            where: {
                wallet: {
                    equals: wallet,
                    mode: 'insensitive'
                },
                airdropId
            }
        });

        if (existing) {
            return NextResponse.json(
                { message: 'Airdrop already saved' },
                { status: 200 }
            );
        }

        const userAirdrop = await prisma.userAirdrop.create({
            data: {
                wallet,
                airdropId
            }
        });

        return NextResponse.json({ userAirdrop }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to save airdrop' },
            { status: 500 }
        );
    }
}

// DELETE /api/my-airdrops - Remove a saved airdrop
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { wallet, airdropId } = body;

        if (!wallet || !airdropId) {
            return NextResponse.json(
                { error: 'Wallet and airdropId are required' },
                { status: 400 }
            );
        }

        await prisma.userAirdrop.deleteMany({
            where: {
                wallet: {
                    equals: wallet,
                    mode: 'insensitive'
                },
                airdropId
            }
        });

        return NextResponse.json({ message: 'Airdrop removed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to remove airdrop' },
            { status: 500 }
        );
    }
}

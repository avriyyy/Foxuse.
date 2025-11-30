import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DEVELOPER_WALLET = "0xed5a458cbf7dca9fabab9b318b8b5e4fcc055f2b";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('wallet');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address required' },
                { status: 400 }
            );
        }

        // Ensure Developer exists in DB
        await prisma.user.upsert({
            where: { wallet: DEVELOPER_WALLET.toLowerCase() },
            update: { role: 'DEVELOPER' },
            create: {
                wallet: DEVELOPER_WALLET.toLowerCase(),
                role: 'DEVELOPER'
            }
        });

        // Check if user is ADMIN or DEVELOPER
        const user = await prisma.user.findUnique({
            where: { wallet: walletAddress.toLowerCase() }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVELOPER')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get total unique users
        const uniqueUsers = await prisma.userAirdrop.groupBy({
            by: ['wallet'],
            _count: {
                wallet: true
            }
        });

        // Get total saved airdrops
        const totalSaved = await prisma.userAirdrop.count();

        // Get user activity list
        const userActivity = await prisma.userAirdrop.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                airdrop: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Aggregate stats per user
        const userStats = uniqueUsers.map(u => ({
            wallet: u.wallet,
            savedCount: u._count.wallet
        }));

        return NextResponse.json({
            stats: {
                totalUsers: uniqueUsers.length,
                totalSavedAirdrops: totalSaved,
                users: userStats,
                recentActivity: userActivity
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        );
    }
}

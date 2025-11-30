import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');
        const airdropId = searchParams.get('airdropId');

        if (!wallet || !airdropId) {
            return NextResponse.json(
                { error: 'Missing wallet or airdropId' },
                { status: 400 }
            );
        }

        const userAirdrop = await prisma.userAirdrop.findUnique({
            where: {
                wallet_airdropId: {
                    wallet,
                    airdropId
                }
            }
        });

        return NextResponse.json({
            completedTasks: userAirdrop?.completedTasks || []
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}

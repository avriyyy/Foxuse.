import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEVELOPER_WALLET = "0xed5a458cbf7dca9fabab9b318b8b5e4fcc055f2b";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet || wallet.toLowerCase() !== DEVELOPER_WALLET.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        // Get all unique wallets from UserAirdrop
        const uniqueWallets = await prisma.userAirdrop.groupBy({
            by: ['wallet']
        });

        // Get all users from User table
        const existingUsers = await prisma.user.findMany();
        const userMap = new Map(existingUsers.map((u: any) => [u.wallet, u]));

        // Merge: Create user entries for all wallets
        const allUsers = uniqueWallets.map(({ wallet }: any) => {
            const existingUser = userMap.get(wallet);
            return existingUser || {
                id: `temp-${wallet}`,
                wallet,
                role: 'USER' as const,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        // Add any users from User table that don't have UserAirdrop entries
        existingUsers.forEach((user: any) => {
            if (!allUsers.find((u: any) => u.wallet === user.wallet)) {
                allUsers.push(user);
            }
        });

        // Sort by role (DEVELOPER first, then ADMIN, then USER)
        allUsers.sort((a: any, b: any) => {
            const roleOrder: Record<string, number> = { DEVELOPER: 0, ADMIN: 1, USER: 2 };
            return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
        });

        return NextResponse.json({ users: allUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { adminWallet, targetWallet, newRole } = body;

        if (!adminWallet || adminWallet.toLowerCase() !== DEVELOPER_WALLET.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (targetWallet.toLowerCase() === DEVELOPER_WALLET.toLowerCase()) {
            return NextResponse.json({ error: "Cannot modify Developer role" }, { status: 403 });
        }

        const user = await prisma.user.upsert({
            where: { wallet: targetWallet.toLowerCase() },
            update: { role: newRole },
            create: {
                wallet: targetWallet.toLowerCase(),
                role: newRole
            }
        });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

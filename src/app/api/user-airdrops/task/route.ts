import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { walletAddress, airdropId, taskId, completed } = body;

        if (!walletAddress || !airdropId || !taskId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find existing user airdrop
        let userAirdrop = await prisma.userAirdrop.findUnique({
            where: {
                wallet_airdropId: {
                    wallet: walletAddress,
                    airdropId: airdropId
                }
            }
        });

        // If not found, create it (Upsert logic manually to handle completedTasks initialization)
        if (!userAirdrop) {
            if (completed) {
                userAirdrop = await prisma.userAirdrop.create({
                    data: {
                        wallet: walletAddress,
                        airdropId: airdropId,
                        completedTasks: [taskId]
                    } as any // Cast to any to avoid type error if client is stale
                });
            } else {
                // If trying to uncomplete a task for a non-existent record, just return success (nothing to do)
                return NextResponse.json({ success: true, completedTasks: [] }, { status: 200 });
            }
        } else {
            // Update completed tasks
            let completedTasks: string[] = [];
            const ua = userAirdrop as any; // Cast to any
            if (ua.completedTasks && Array.isArray(ua.completedTasks)) {
                completedTasks = ua.completedTasks as string[];
            }

            if (completed) {
                if (!completedTasks.includes(taskId)) {
                    completedTasks.push(taskId);
                }
            } else {
                completedTasks = completedTasks.filter(id => id !== taskId);
            }

            const updated = await prisma.userAirdrop.update({
                where: {
                    wallet_airdropId: {
                        wallet: walletAddress,
                        airdropId: airdropId
                    }
                },
                data: {
                    completedTasks
                } as any // Cast to any
            });
            userAirdrop = updated;
        }

        return NextResponse.json({ success: true, completedTasks: (userAirdrop as any).completedTasks }, { status: 200 });

    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

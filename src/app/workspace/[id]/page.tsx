import { WorkspaceView } from "@/components/workspace/workspace-view";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Correctly type the props for Next.js 15
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
    const { id } = await params;

    // Fetch directly from database instead of static file
    const app = await prisma.airdrop.findUnique({
        where: { id }
    });

    if (!app) {
        notFound();
    }

    // Transform database object to match AirdropApp interface if needed
    // or ensure WorkspaceView can handle the Prisma model
    return <WorkspaceView app={app as any} />;
}

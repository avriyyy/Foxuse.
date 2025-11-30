"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Bookmark, Loader2, Wallet, Search, LayoutGrid, List, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AirdropApp } from "@/types";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function MyAirdrops() {
    const { address, isConnected } = useAccount();
    const [savedAirdrops, setSavedAirdrops] = useState<AirdropApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { toast } = useToast();

    useEffect(() => {
        if (isConnected && address) {
            fetchSavedAirdrops(address);
        } else {
            setLoading(false);
            setSavedAirdrops([]);
        }
    }, [isConnected, address]);

    const fetchSavedAirdrops = async (walletAddress: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/my-airdrops?wallet=${walletAddress}`);
            const data = await res.json();

            if (data.airdrops) {
                setSavedAirdrops(data.airdrops);
            }
        } catch (error) {
            console.error("Error fetching saved airdrops:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!address) return;

        try {
            const res = await fetch('/api/my-airdrops', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: address, airdropId: id })
            });

            if (res.ok) {
                setSavedAirdrops(savedAirdrops.filter(a => a.id !== id));
                toast("Airdrop removed from your list", "info");
            } else {
                toast("Failed to remove airdrop", "error");
            }
        } catch (error) {
            console.error("Error removing airdrop:", error);
            toast("An error occurred", "error");
        }
    };

    const filteredAirdrops = savedAirdrops.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-100">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase mb-2">My Airdrops</h1>
                        <p className="text-lg font-medium text-zinc-600">
                            Your saved airdrop opportunities
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search saved..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-64 rounded-md border-2 border-zinc-200 bg-white pl-10 pr-4 text-sm font-bold outline-none focus:border-black focus:ring-0 transition-colors"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-white rounded-md border-2 border-zinc-200 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-1.5 rounded transition-colors",
                                    viewMode === 'grid' ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded transition-colors",
                                    viewMode === 'list' ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {!isConnected ? (
                    <Card className="text-center p-12">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-primary p-6 neo-shadow">
                                <Wallet className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        <h2 className="mb-4 text-2xl font-black uppercase">Connect Your Wallet</h2>
                        <p className="mb-6 text-lg font-medium text-zinc-600">
                            Connect your wallet to view your saved airdrops.
                        </p>
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                    </Card>
                ) : loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : savedAirdrops.length === 0 ? (
                    <Card className="text-center p-12">
                        <Bookmark className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
                        <h2 className="mb-4 text-2xl font-black uppercase">No Saved Airdrops</h2>
                        <p className="mb-6 text-lg font-medium text-zinc-600">
                            You haven't saved any airdrops yet. Browse the dashboard to find opportunities!
                        </p>
                        <Link href="/dashboard">
                            <Button size="lg">Browse Airdrops</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredAirdrops.map((airdrop) => (
                            <Card key={airdrop.id} className={cn(
                                "group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
                                viewMode === 'list' ? "flex flex-row items-center p-6 gap-6" : "flex flex-col justify-between p-6"
                            )}>
                                <div className={cn(
                                    "flex flex-col",
                                    viewMode === 'list' ? "flex-1" : "h-full"
                                )}>
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <Badge variant="outline" className="mb-2">{airdrop.category}</Badge>
                                            <h3 className="text-xl font-black uppercase">{airdrop.name}</h3>
                                        </div>
                                        <Badge
                                            className={
                                                airdrop.difficulty === "Easy"
                                                    ? "bg-green-400 text-black"
                                                    : airdrop.difficulty === "Medium"
                                                        ? "bg-yellow-400 text-black"
                                                        : "bg-red-500 text-white"
                                            }
                                        >
                                            {airdrop.difficulty}
                                        </Badge>
                                    </div>

                                    <p className="mb-6 text-sm text-zinc-600 line-clamp-2">
                                        {airdrop.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-6">
                                        <span>Potential: {airdrop.potential}</span>
                                        <span>Tasks: {Array.isArray(airdrop.tasks) ? airdrop.tasks.length : 0}</span>
                                    </div>

                                    <div className="mt-auto flex gap-3">
                                        <Link href={`/workspace/${airdrop.id}?from=my-airdrops`} className="flex-1">
                                            <Button className="w-full gap-2 font-bold" variant="primary">
                                                <Play className="h-4 w-4" />
                                                LAUNCH
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemove(airdrop.id)}
                                            className="border-2 border-black"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

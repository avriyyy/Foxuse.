"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Bookmark, Search, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AirdropApp } from "@/types";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [airdrops, setAirdrops] = useState<AirdropApp[]>([]);
    const [savedAirdropIds, setSavedAirdropIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { toast } = useToast();

    useEffect(() => {
        const fetchAirdrops = async () => {
            try {
                const res = await fetch('/api/airdrops');
                const data = await res.json();
                if (data.airdrops) {
                    setAirdrops(data.airdrops);
                }
            } catch (error) {
                console.error("Error fetching airdrops:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAirdrops();
    }, []);

    useEffect(() => {
        const fetchSavedAirdrops = async () => {
            if (!address) return;
            try {
                const res = await fetch(`/api/my-airdrops?wallet=${address}`);
                const data = await res.json();
                if (data.airdrops) {
                    setSavedAirdropIds(data.airdrops.map((a: AirdropApp) => a.id));
                }
            } catch (error) {
                console.error("Error fetching saved airdrops:", error);
            }
        };

        if (isConnected && address) {
            fetchSavedAirdrops();
        } else {
            setSavedAirdropIds([]);
        }
    }, [address, isConnected]);

    const handleSave = async (airdropId: string) => {
        if (!address) {
            toast("Please connect your wallet first", "error");
            return;
        }

        // Optimistic update
        const isSaved = savedAirdropIds.includes(airdropId);
        if (isSaved) {
            // Remove
            setSavedAirdropIds(prev => prev.filter(id => id !== airdropId));
            try {
                const res = await fetch('/api/my-airdrops', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet: address, airdropId })
                });
                if (!res.ok) throw new Error("Failed to remove");
                toast("Removed from saved airdrops", "info");
            } catch (error) {
                setSavedAirdropIds(prev => [...prev, airdropId]); // Revert
                toast("Failed to remove airdrop", "error");
            }
        } else {
            // Save
            setSavedAirdropIds(prev => [...prev, airdropId]);
            try {
                const res = await fetch('/api/my-airdrops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        wallet: address,
                        airdropId: airdropId
                    })
                });
                if (!res.ok) throw new Error("Failed to save");
                toast("Airdrop saved!", "success");
            } catch (error) {
                setSavedAirdropIds(prev => prev.filter(id => id !== airdropId)); // Revert
                toast("Failed to save airdrop", "error");
            }
        }
    };

    const filteredAirdrops = airdrops.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-100">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase">Dashboard</h1>
                        <p className="text-zinc-600">Explore and hunt for new airdrops</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search airdrops..."
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

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="h-64 animate-pulse bg-zinc-200" />
                        ))}
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredAirdrops.map((app) => {
                            const isSaved = savedAirdropIds.includes(app.id);
                            return (
                                <Card key={app.id} className={cn(
                                    "group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
                                    viewMode === 'list' ? "flex flex-row items-center p-6 gap-6" : "flex flex-col justify-between p-6"
                                )}>
                                    <div className={cn(
                                        "flex flex-col",
                                        viewMode === 'list' ? "flex-1" : "h-full"
                                    )}>
                                        <div className="mb-4 flex items-start justify-between">
                                            <div>
                                                <Badge variant="outline" className="mb-2">{app.category}</Badge>
                                                <h3 className="text-xl font-black uppercase">{app.name}</h3>
                                            </div>
                                            <Badge className={
                                                app.difficulty === 'Easy' ? 'bg-green-400 text-black' :
                                                    app.difficulty === 'Medium' ? 'bg-yellow-400 text-black' :
                                                        'bg-red-500 text-white'
                                            }>{app.difficulty}</Badge>
                                        </div>

                                        <p className="mb-6 text-sm text-zinc-600 line-clamp-2">{app.description}</p>

                                        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-6">
                                            <span>Potential: {app.potential}</span>
                                            <span>Tasks: {Array.isArray(app.tasks) ? app.tasks.length : 0}</span>
                                        </div>

                                        <div className="mt-auto flex gap-3">
                                            <Link href={`/workspace/${app.id}?from=dashboard`} className="flex-1">
                                                <Button className="w-full gap-2 font-bold" variant="primary">
                                                    <Play className="h-4 w-4" />
                                                    LAUNCH
                                                </Button>
                                            </Link>
                                            <Button
                                                variant={isSaved ? "secondary" : "outline"}
                                                size="icon"
                                                onClick={() => handleSave(app.id)}
                                                className={cn(
                                                    "border-2",
                                                    isSaved ? "border-purple-600" : "border-zinc-200 hover:border-purple-600 hover:text-purple-600"
                                                )}
                                            >
                                                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit, Save, X, Shield, Users, Activity, LayoutDashboard, List } from "lucide-react";
import { AirdropApp } from "@/types";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// STRICT ADMIN WALLET
const ADMIN_WALLET = "0xed5a458cbf7dca9fabab9b318b8b5e4fcc055f2b";

interface AdminStats {
    totalUsers: number;
    totalSavedAirdrops: number;
    users: { wallet: string; savedCount: number }[];
    recentActivity: {
        id: string;
        wallet: string;
        createdAt: string;
        airdrop: { name: string };
    }[];
}

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | 'DEVELOPER'>('USER');
    const [activeTab, setActiveTab] = useState<'overview' | 'airdrops' | 'users'>('overview');
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');

    // Data State
    const [airdrops, setAirdrops] = useState<AirdropApp[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<AirdropApp>>({
        name: "",
        description: "",
        category: "DeFi",
        difficulty: "Medium",
        potential: "Medium",
        url: "",
        tasks: [],
        imageUrl: "/placeholder.png"
    });

    useEffect(() => {
        if (isConnected && address) {
            checkAuth();
        } else {
            setIsAuthorized(false);
            setLoading(false);
        }
    }, [isConnected, address]);

    const checkAuth = async () => {
        setLoading(true);
        try {
            // Check if user is Developer (hardcoded)
            if (address?.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
                setIsAuthorized(true);
                setUserRole('DEVELOPER');
                fetchData('DEVELOPER');
                return;
            }

            // Check if user is Admin (from DB)
            const res = await fetch(`/api/admin/stats?wallet=${address}`);
            if (res.ok) {
                setIsAuthorized(true);
                setUserRole('ADMIN');
                fetchData('ADMIN');
            } else {
                setIsAuthorized(false);
                setLoading(false);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthorized(false);
            setLoading(false);
        }
    };

    const fetchData = async (role: string) => {
        setLoading(true);
        try {
            // Fetch Airdrops
            const airdropsRes = await fetch('/api/airdrops');
            const airdropsData = await airdropsRes.json();
            if (airdropsData.airdrops) setAirdrops(airdropsData.airdrops);

            // Fetch Stats
            const statsRes = await fetch(`/api/admin/stats?wallet=${address}`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                if (statsData.stats) setStats(statsData.stats);
            }

            // Fetch Users (Only if Developer)
            if (role === 'DEVELOPER') {
                const usersRes = await fetch(`/api/admin/users?wallet=${address}`);
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData.users || []);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;

        try {
            const url = editingId ? `/api/airdrops/${editingId}` : '/api/airdrops';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, walletAddress: address })
            });

            if (res.ok) {
                fetchData(userRole);
                resetForm();
                alert(editingId ? "Airdrop updated!" : "Airdrop created!");
            } else {
                alert("Failed to save airdrop");
            }
        } catch (error) {
            console.error("Error saving airdrop:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this airdrop?")) return;
        if (!address) return;

        try {
            const res = await fetch(`/api/airdrops/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address })
            });

            if (res.ok) {
                setAirdrops(airdrops.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error("Error deleting airdrop:", error);
        }
    };

    const handleEdit = (app: AirdropApp) => {
        setEditingId(app.id);
        setFormData(app);
        setView('edit');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            category: "DeFi",
            difficulty: "Medium",
            potential: "Medium",
            url: "",
            tasks: [],
            imageUrl: "/placeholder.png"
        });
        setView('create');
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            category: "DeFi",
            difficulty: "Medium",
            potential: "Medium",
            url: "",
            tasks: [],
            imageUrl: "/placeholder.png"
        });
        setView('list');
    };

    const handleRoleUpdate = async (targetWallet: string, newRole: string) => {
        if (!address) return;
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminWallet: address,
                    targetWallet,
                    newRole
                })
            });

            if (res.ok) {
                alert("User role updated!");
                fetchData('DEVELOPER'); // Refresh list
            } else {
                alert("Failed to update role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-zinc-100">
                <Navbar />
                <div className="flex min-h-[80vh] items-center justify-center p-6">
                    <Card className="max-w-md p-8 text-center">
                        <h2 className="mb-4 text-2xl font-black uppercase">Admin Access Required</h2>
                        <p className="mb-6 text-zinc-600">Please connect the authorized admin wallet.</p>
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-zinc-100">
                <Navbar />
                <div className="flex min-h-[80vh] items-center justify-center p-6">
                    <Card className="max-w-md p-8 text-center border-red-500">
                        <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="mb-4 text-2xl font-black uppercase text-red-500">Access Denied</h2>
                        <p className="mb-6 text-zinc-600">
                            Wallet <strong>{address?.slice(0, 6)}...{address?.slice(-4)}</strong> is not authorized.
                        </p>
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100">
            <Navbar />
            <main className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black uppercase">Admin Panel</h1>
                        <p className="text-zinc-600">System Overview & Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className={
                            userRole === 'DEVELOPER' ? "bg-purple-100 text-purple-700 border-purple-200 px-4 py-2" :
                                "bg-green-100 text-green-700 border-green-200 px-4 py-2"
                        }>
                            {userRole}: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </Badge>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-8 border-b border-zinc-200 pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors ${activeTab === 'overview'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-zinc-500 hover:text-zinc-800'
                            }`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('airdrops')}
                        className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors ${activeTab === 'airdrops'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-zinc-500 hover:text-zinc-800'
                            }`}
                    >
                        <List className="h-4 w-4" />
                        Airdrops
                    </button>
                    {userRole === 'DEVELOPER' && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Users
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : activeTab === 'overview' ? (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-500 uppercase">Total Users</p>
                                        <p className="text-3xl font-black">{stats?.totalUsers || 0}</p>
                                    </div>
                                    <div className="rounded-full bg-blue-500/10 p-4">
                                        <Users className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-500 uppercase">Total Airdrops</p>
                                        <p className="text-3xl font-black">{airdrops.length}</p>
                                    </div>
                                    <div className="rounded-full bg-pink-500/10 p-4">
                                        <List className="h-8 w-8 text-pink-500" />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Activity & Users */}
                        <div className="grid gap-8 lg:grid-cols-2">
                            <Card className="p-6">
                                <h3 className="mb-4 text-xl font-black uppercase">Recent Activity</h3>
                                <div className="space-y-4">
                                    {stats?.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
                                            <div>
                                                <p className="font-bold text-sm">{activity.wallet.slice(0, 6)}...{activity.wallet.slice(-4)}</p>
                                                <p className="text-xs text-zinc-500">Saved <strong>{activity.airdrop.name}</strong></p>
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                        <p className="text-zinc-500 text-sm">No recent activity.</p>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="mb-4 text-xl font-black uppercase">User Leaderboard</h3>
                                <div className="space-y-4">
                                    {stats?.users.map((user, idx) => (
                                        <div key={user.wallet} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-zinc-400 w-6">#{idx + 1}</span>
                                                <p className="font-bold text-sm">{user.wallet}</p>
                                            </div>
                                            <Badge variant="secondary">{user.savedCount} Saved</Badge>
                                        </div>
                                    ))}
                                    {(!stats?.users || stats.users.length === 0) && (
                                        <p className="text-zinc-500 text-sm">No users found.</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : activeTab === 'airdrops' ? (
                    <div className="space-y-6">
                        {/* Airdrops Management */}
                        {view === 'list' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black uppercase">All Airdrops</h2>
                                    <Button onClick={handleCreate} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add New Airdrop
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {airdrops.map(app => (
                                        <Card key={app.id} className="p-6 flex items-start justify-between group hover:border-pink-500 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-xl font-black uppercase">{app.name}</h3>
                                                    <Badge variant="outline">{app.category}</Badge>
                                                    <Badge className={
                                                        app.difficulty === 'Easy' ? 'bg-green-400 text-black' :
                                                            app.difficulty === 'Medium' ? 'bg-yellow-400 text-black' :
                                                                'bg-red-500 text-white'
                                                    }>{app.difficulty}</Badge>
                                                </div>
                                                <p className="text-zinc-600 mb-4">{app.description}</p>
                                                <div className="flex gap-4 text-sm font-bold text-zinc-500">
                                                    <span>Potential: {app.potential}</span>
                                                    <span>Tasks: {Array.isArray(app.tasks) ? app.tasks.length : 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(app)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(app.id)} className="border-red-500 text-red-500 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(view === 'create' || view === 'edit') && (
                            <div className="max-w-2xl mx-auto">
                                <Button variant="ghost" className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                    Cancel & Back to List
                                </Button>

                                <Card className="p-8">
                                    <h2 className="mb-6 text-2xl font-black uppercase flex items-center gap-2">
                                        {view === 'edit' ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                                        {view === 'edit' ? "Edit Airdrop" : "Add New Airdrop"}
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Name</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    placeholder="e.g. Starknet"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Potential</label>
                                                <select
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                    value={formData.potential}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, potential: e.target.value as any })}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Category</label>
                                                <select
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                    value={formData.category}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value as any })}
                                                >
                                                    <option value="DeFi">DeFi</option>
                                                    <option value="NFT">NFT</option>
                                                    <option value="L2">L2</option>
                                                    <option value="GameFi">GameFi</option>
                                                    <option value="Infrastructure">Infrastructure</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Difficulty</label>
                                                <select
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                                                    value={formData.difficulty}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Description</label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                                placeholder="Brief description..."
                                                className="min-h-[80px]"
                                            />
                                        </div>

                                        {/* Task Management Section - ONLY IN EDIT MODE */}
                                        {view === 'edit' && (
                                            <div className="border-t border-zinc-200 pt-4 mt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-sm font-black uppercase">Tasks</label>
                                                    <Badge variant="secondary" className="text-xs">{formData.tasks?.length || 0}</Badge>
                                                </div>

                                                <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto pr-1">
                                                    {formData.tasks?.map((task, index) => (
                                                        <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2 rounded border border-zinc-200">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">{task.title}</p>
                                                                <p className="text-[10px] text-zinc-500 truncate">{task.url}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-red-500 hover:bg-red-50"
                                                                onClick={() => {
                                                                    const newTasks = [...(formData.tasks || [])];
                                                                    newTasks.splice(index, 1);
                                                                    setFormData({ ...formData, tasks: newTasks });
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {(!formData.tasks || formData.tasks.length === 0) && (
                                                        <p className="text-xs text-zinc-500 italic text-center py-2">No tasks added yet.</p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 p-2 bg-zinc-50 rounded border border-zinc-200">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            placeholder="Task Title"
                                                            id="newTaskTitle"
                                                            className="h-8 text-xs bg-white"
                                                        />
                                                        <Input
                                                            placeholder="Task URL"
                                                            id="newTaskUrl"
                                                            className="h-8 text-xs bg-white"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        className="h-auto w-10"
                                                        size="sm"
                                                        onClick={() => {
                                                            const titleInput = document.getElementById('newTaskTitle') as HTMLInputElement;
                                                            const urlInput = document.getElementById('newTaskUrl') as HTMLInputElement;

                                                            if (titleInput.value) {
                                                                const newTask = {
                                                                    id: crypto.randomUUID(),
                                                                    title: titleInput.value,
                                                                    url: urlInput.value,
                                                                    completed: false
                                                                };
                                                                setFormData({
                                                                    ...formData,
                                                                    tasks: [...(formData.tasks || []), newTask]
                                                                });
                                                                titleInput.value = '';
                                                                urlInput.value = '';
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-zinc-100">
                                            <Button type="submit" className="w-full" disabled={loading}>
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                {view === 'edit' ? "Update Airdrop" : "Create Airdrop"}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black uppercase">User Management</h2>
                                <Badge variant="secondary">{users.length} Users</Badge>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <Input
                                    placeholder="Search by wallet address..."
                                    onChange={(e) => {
                                        const searchTerm = e.target.value.toLowerCase();
                                        const userList = document.getElementById('userList');
                                        if (userList) {
                                            const userItems = userList.querySelectorAll('[data-wallet]');
                                            userItems.forEach((item) => {
                                                const wallet = item.getAttribute('data-wallet') || '';
                                                if (wallet.toLowerCase().includes(searchTerm)) {
                                                    (item as HTMLElement).style.display = '';
                                                } else {
                                                    (item as HTMLElement).style.display = 'none';
                                                }
                                            });
                                        }
                                    }}
                                />
                            </div>

                            {/* User List */}
                            <div id="userList" className="space-y-4">
                                {users.map((user) => (
                                    <div key={user.id} data-wallet={user.wallet} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0">
                                        <div>
                                            <p className="font-bold">{user.wallet}</p>
                                            <p className="text-xs text-zinc-500">Role: <span className="font-bold uppercase">{user.role}</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            {user.role !== 'DEVELOPER' && (
                                                user.role === 'USER' ? (
                                                    <Button size="sm" onClick={() => handleRoleUpdate(user.wallet, 'ADMIN')}>
                                                        Promote to Admin
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => handleRoleUpdate(user.wallet, 'USER')}>
                                                        Demote to User
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <p className="text-zinc-500 text-sm text-center py-4">No users yet. Users will appear here once they save an airdrop.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                ) : null}
            </main>
        </div>
    );
}

"use client";

import { AirdropApp, Task } from "@/types";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Maximize2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "wagmi";

interface WorkspaceViewProps {
    app: AirdropApp;
}

export function WorkspaceView({ app }: WorkspaceViewProps) {
    const [tasks, setTasks] = useState(app.tasks);
    const [currentPopup, setCurrentPopup] = useState<Window | null>(null);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const popupCheckInterval = useRef<any>(undefined);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { address } = useAccount();

    // Fetch progress on mount
    useEffect(() => {
        const fetchProgress = async () => {
            if (!address) return;
            try {
                const res = await fetch(`/api/user-airdrops/progress?wallet=${address}&airdropId=${app.id}`);
                const data = await res.json();
                if (data.completedTasks) {
                    setTasks(prev => prev.map(t => ({
                        ...t,
                        completed: data.completedTasks.includes(t.id)
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch progress:", error);
            }
        };
        fetchProgress();
    }, [address, app.id]);

    const toggleTask = async (taskId: string) => {
        if (!address) {
            toast("Please connect your wallet first", "error");
            return;
        }

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newCompletedStatus = !task.completed;

        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, completed: newCompletedStatus } : t
        ));

        try {
            const res = await fetch('/api/user-airdrops/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    airdropId: app.id,
                    taskId,
                    completed: newCompletedStatus
                })
            });

            if (!res.ok) throw new Error("Failed to save");

            if (newCompletedStatus) {
                toast("Task completed!", "success");
            }
        } catch (error) {
            // Revert on error
            setTasks(tasks.map(t =>
                t.id === taskId ? { ...t, completed: !newCompletedStatus } : t
            ));
            toast("Failed to save progress", "error");
        }
    };

    const handleBack = () => {
        const from = searchParams.get('from');
        if (from === 'my-airdrops') {
            router.push('/my-airdrops');
        } else {
            router.push('/dashboard');
        }
    };

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    const openTaskWindow = (task: Task) => {
        const url = task.url || app.url;

        if (currentPopup && !currentPopup.closed) {
            currentPopup.close();
        }

        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        const popupWidth = Math.floor(screenWidth * 0.7);
        const popupHeight = Math.floor(screenHeight * 0.85);
        const left = screenWidth - popupWidth - 10;
        const top = 10;

        const features = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=yes,menubar=no,location=yes`;
        const newWindow = window.open(url, `foxuse_${app.id}_${task.id}`, features);

        if (newWindow) {
            newWindow.focus();
            setCurrentPopup(newWindow);
            setCurrentTaskId(task.id);
            setIsPopupOpen(true);
        }
    };

    const closePopup = () => {
        if (currentPopup && !currentPopup.closed) {
            currentPopup.close();
        }
        setIsPopupOpen(false);
        setCurrentPopup(null);
        setCurrentTaskId(null);
    };

    const focusPopup = () => {
        if (currentPopup && !currentPopup.closed) {
            currentPopup.focus();
        }
    };

    useEffect(() => {
        if (currentPopup) {
            popupCheckInterval.current = setInterval(() => {
                if (currentPopup.closed) {
                    setIsPopupOpen(false);
                    setCurrentPopup(null);
                    setCurrentTaskId(null);
                    if (popupCheckInterval.current) {
                        clearInterval(popupCheckInterval.current);
                    }
                }
            }, 500);
        }

        return () => {
            if (popupCheckInterval.current) {
                clearInterval(popupCheckInterval.current);
            }
        };
    }, [currentPopup]);

    useEffect(() => {
        return () => {
            if (currentPopup && !currentPopup.closed) {
                currentPopup.close();
            }
        };
    }, []);

    const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) : null;

    return (
        <div className="h-screen w-full overflow-hidden bg-zinc-100 flex flex-col">
            {/* Top Bar */}
            <header className="flex h-14 items-center justify-between border-b-4 border-black bg-white px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="h-6 w-[2px] bg-zinc-300" />
                    <h1 className="text-lg font-black uppercase">{app.name}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-zinc-500">Progress:</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-24 overflow-hidden border border-black bg-zinc-100">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Sidebar - Task List */}
                    <Panel defaultSize={30} minSize={25} maxSize={50} className="bg-white">
                        <div className="flex h-full flex-col">
                            <div className="border-b-2 border-black p-4 bg-zinc-50">
                                <h2 className="font-black uppercase text-lg mb-1">Mission Control</h2>
                                <p className="text-xs text-zinc-500">Complete tasks to qualify for the airdrop.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {tasks.map((task) => {
                                    const hasUrl = !!task.url;

                                    return (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "p-3 border-2 transition-all",
                                                task.completed
                                                    ? "bg-zinc-100 border-zinc-300 text-zinc-500"
                                                    : "bg-white border-black neo-shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className="shrink-0 hover:scale-110 transition-transform"
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <p className={cn("font-bold text-sm", task.completed && "line-through")}>
                                                            {task.title}
                                                        </p>
                                                        {task.description && (
                                                            <p className="text-xs mt-1 opacity-80">{task.description}</p>
                                                        )}
                                                    </div>

                                                    {/* Show button only if task has URL */}
                                                    {hasUrl && (
                                                        <Button
                                                            onClick={() => openTaskWindow(task)}
                                                            variant="success"
                                                            size="sm"
                                                            className="gap-2"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Open Task
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t-2 border-black bg-zinc-50">
                                <div className="text-xs font-mono text-zinc-400 text-center">
                                    FOXUSE WORKSPACE v1.0
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-zinc-200 hover:bg-primary transition-colors border-l-2 border-r-2 border-black flex items-center justify-center">
                        <div className="h-8 w-1 bg-black rounded-full" />
                    </PanelResizeHandle>

                    {/* Main Content - Popup Control Panel */}
                    <Panel className="bg-zinc-100">
                        <div className="h-full flex flex-col p-6">
                            <div className="flex-1 flex flex-col neo-border neo-shadow-lg bg-white">
                                {/* Header */}
                                <div className="p-4 border-b-2 border-black bg-zinc-50 flex-shrink-0">
                                    <h2 className="text-xl font-black uppercase">{app.name}</h2>
                                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{app.description}</p>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
                                    {/* Status */}
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-between p-2 bg-zinc-50 border-2 border-black">
                                            <span className="text-xs font-bold uppercase">Status:</span>
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 border-2 border-black",
                                                isPopupOpen ? "bg-green-400" : "bg-zinc-200"
                                            )}>
                                                {isPopupOpen ? "OPEN" : "CLOSED"}
                                            </span>
                                        </div>

                                        {currentTask && isPopupOpen && (
                                            <div className="mt-2 p-2 bg-lime-50 border-2 border-black">
                                                <p className="text-xs font-bold">{currentTask.title}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex-shrink-0 space-y-2">
                                        {isPopupOpen ? (
                                            <>
                                                <Button
                                                    onClick={focusPopup}
                                                    className="w-full gap-2"
                                                    variant="accent"
                                                >
                                                    <Maximize2 className="h-4 w-4" />
                                                    Focus Window
                                                </Button>
                                                <Button
                                                    onClick={closePopup}
                                                    className="w-full gap-2"
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <X className="h-3 w-3" />
                                                    Close
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="p-3 bg-yellow-50 border-2 border-yellow-600 text-center">
                                                <p className="text-xs font-bold text-zinc-700">
                                                    Click "Open Task" to start
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions */}
                                    <div className="flex-1 min-h-0 overflow-y-auto">
                                        <div className="p-3 border-2 border-black bg-white h-full">
                                            <h3 className="font-black uppercase text-xs mb-2">How to Use:</h3>
                                            <ol className="text-xs space-y-1 text-zinc-600 list-decimal list-inside">
                                                <li>Click "Open Task" to launch dApp</li>
                                                <li>Complete task in popup window</li>
                                                <li>Use "Focus Window" to switch back</li>
                                                <li>Mark task complete when done</li>
                                            </ol>
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div className="flex-shrink-0 p-2 bg-blue-50 border-2 border-blue-600">
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm">💡</span>
                                            <p className="text-xs text-zinc-700">
                                                Use <strong>Alt+Tab</strong> to switch windows
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-2 border-t-2 border-black bg-zinc-50 flex-shrink-0">
                                    <div className="text-xs font-mono text-zinc-400 text-center">
                                        POPUP CONTROL
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}

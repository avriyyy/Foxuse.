"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "flex items-center gap-3 min-w-[300px] p-4 rounded-md border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all animate-in slide-in-from-right-full",
                            t.type === "success" && "bg-green-100 border-black text-green-800",
                            t.type === "error" && "bg-red-100 border-black text-red-800",
                            t.type === "info" && "bg-blue-100 border-black text-blue-800"
                        )}
                    >
                        {t.type === "success" && <CheckCircle className="h-5 w-5" />}
                        {t.type === "error" && <AlertCircle className="h-5 w-5" />}
                        {t.type === "info" && <Info className="h-5 w-5" />}
                        <p className="flex-1 font-bold text-sm">{t.message}</p>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-current opacity-70 hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

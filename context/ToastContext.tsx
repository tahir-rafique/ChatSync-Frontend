"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: {
        success: (msg: string) => void;
        error: (msg: string) => void;
        info: (msg: string) => void;
        loading: (msg: string) => string;
        dismiss: (id: string) => void;
    };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (type !== "loading") {
            setTimeout(() => dismiss(id), 5000);
        }
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg: string) => addToast(msg, "success"),
        error: (msg: string) => addToast(msg, "error"),
        info: (msg: string) => addToast(msg, "info"),
        loading: (msg: string) => addToast(msg, "loading"),
        dismiss,
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 shadow-2xl ${t.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : t.type === "error"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : t.type === "loading"
                                    ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {t.type === "success" && <CheckCircle size={18} />}
                            {t.type === "error" && <AlertCircle size={18} />}
                            {t.type === "info" && <Info size={18} />}
                            {t.type === "loading" && <Loader2 size={18} className="animate-spin" />}
                            <p className="text-sm font-medium">{t.message}</p>
                        </div>
                        <button onClick={() => dismiss(t.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context.toast;
}

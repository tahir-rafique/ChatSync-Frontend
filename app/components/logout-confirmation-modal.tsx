"use client";
import React from "react";
import { LogOut, X, AlertTriangle } from "lucide-react";

interface LogoutConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutConfirmationModal({
    onClose,
    onConfirm,
}: LogoutConfirmationModalProps) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center animate-overlay-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm mx-4 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/50 overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-600/10 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-10"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                        <LogOut size={32} className="text-rose-500" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Logout</h2>
                    <p className="text-zinc-400 text-sm mb-8">
                        Are you sure you want to sign out? You will need to login again to access your chats.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
                        >
                            Log Out
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Footer status */}
                <div className="px-8 py-4 bg-zinc-800/30 border-t border-zinc-800/50 flex items-center justify-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500/80" />
                    <span className="text-[11px] text-zinc-500 font-medium">Session will be terminated</span>
                </div>
            </div>
        </div>
    );
}

"use client";
import React from "react";
import { MessageCircle, Users, UserPlus, Sparkles } from "lucide-react";

interface EmptyStateProps {
    onOpenFriends: () => void;
    onOpenAddFriend: () => void;
}

export default function EmptyState({ onOpenFriends, onOpenAddFriend }: EmptyStateProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-screen bg-zinc-950 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6 animate-fade-in">
                {/* Logo Animation */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/25 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <MessageCircle size={40} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 -rotate-12">
                        <Sparkles size={16} className="text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    Welcome to ChatSync
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                    Select a conversation from the sidebar to start chatting, or connect with new people. Share messages, photos, videos, and files seamlessly.
                </p>

                {/* Feature cards */}
                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 text-left group hover:border-violet-500/30 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3 group-hover:bg-violet-500/25 transition-colors">
                            <MessageCircle size={18} className="text-violet-400" />
                        </div>
                        <p className="text-sm text-zinc-200 font-semibold mb-1">Real-time Chat</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Send text, emoji, and react to messages instantly</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 text-left group hover:border-indigo-500/30 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-3 group-hover:bg-indigo-500/25 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-200 font-semibold mb-1">File Sharing</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Share photos, videos, audio and documents</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 text-left group hover:border-emerald-500/30 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3 group-hover:bg-emerald-500/25 transition-colors">
                            <Users size={18} className="text-emerald-400" />
                        </div>
                        <p className="text-sm text-zinc-200 font-semibold mb-1">Friends</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">See who&apos;s online and manage your contacts</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 text-left group hover:border-rose-500/30 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center mb-3 group-hover:bg-rose-500/25 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-200 font-semibold mb-1">Voice & Video</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Make calls directly from your conversations</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenFriends}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-300 text-sm font-semibold border border-zinc-700/50 hover:bg-zinc-700/80 hover:text-white transition-all hover:scale-105 active:scale-95"
                    >
                        <Users size={16} />
                        View Friends
                    </button>
                    <button
                        onClick={onOpenAddFriend}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <UserPlus size={16} />
                        Add Friends
                    </button>
                </div>
            </div>
        </div>
    );
}

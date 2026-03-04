"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    X,
    Search,
    UserPlus,
    UserCheck,
    Clock,
    Send,
    Users,
    Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface SearchUser {
    id: string;
    name: string;
    avatar: string;
    email: string;
    status: "none" | "pending" | "friends";
}

interface PendingRequest {
    id: string;
    from: {
        id: string;
        name: string;
        email: string;
        avatar: string;
    };
    time: string;
}

interface AddFriendModalProps {
    onClose: () => void;
    onRefresh?: () => void;
}

export default function AddFriendModal({
    onClose,
    onRefresh,
}: AddFriendModalProps) {
    const toast = useToast();
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<SearchUser[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [searching, setSearching] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [tab, setTab] = useState<"search" | "requests">("search");

    // Fetch pending requests
    const fetchPending = useCallback(async () => {
        setLoadingRequests(true);
        try {
            const res = await apiRequest("/users/friends/requests");
            const formatted = res.data.requests.map((r: any) => ({
                id: r._id,
                from: {
                    id: r.from._id,
                    name: r.from.name,
                    email: r.from.email,
                    avatar: r.from.avatar || r.from.name[0].toUpperCase(),
                },
                time: new Date(r.createdAt).toLocaleDateString(),
            }));
            setPendingRequests(formatted);
        } catch (err: any) {
            console.error("Failed to fetch pending requests:", err);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "requests") {
            fetchPending();
        }
    }, [tab, fetchPending]);

    // Search users with debounce
    useEffect(() => {
        const fetchUserData = async () => {
            setSearching(true);
            try {
                // If search is empty, fetch all users, otherwise search by query
                const endpoint = !search.trim()
                    ? "/users"
                    : `/users/search?q=${encodeURIComponent(search)}`;

                const res = await apiRequest(endpoint);

                // Handle different response structures if necessary
                const rawUsers = res.data.docs || res.data.users || [];

                const formatted = rawUsers.map((u: any) => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    avatar: u.avatar || u.name[0].toUpperCase(),
                    status: u.isFriend ? "friends" : u.isPending ? "pending" : "none",
                }));
                setUsers(formatted);
            } catch (err) {
                console.error("Fetch users failed:", err);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(fetchUserData, search.trim() ? 500 : 0);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSendRequest = async (userId: string) => {
        try {
            await apiRequest(`/users/friends/request/${userId}`, { method: "POST" });
            toast.success("Friend request sent!");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "pending" } : u));
        } catch (err: any) {
            toast.error(err.message || "Failed to send request");
        }
    };

    const handleAction = async (requestId: string, requesterId: string, action: "accept" | "reject") => {
        try {
            await apiRequest(`/users/friends/${action}/${requesterId}`, { method: "POST" });
            toast.success(`Request ${action}ed!`);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            if (action === "accept" && onRefresh) {
                onRefresh();
            }
        } catch (err: any) {
            toast.error(err.message || `Failed to ${action} request`);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg mx-4 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/50 overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-600/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <UserPlus size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Add Friends</h2>
                                <p className="text-xs text-zinc-500">
                                    Search and connect with people
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mb-3">
                        <button
                            onClick={() => setTab("search")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === "search"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            <Search size={14} /> Search Users
                        </button>
                        <button
                            onClick={() => setTab("requests")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${tab === "requests"
                                ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            <Clock size={14} /> Pending
                            {pendingRequests.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-violet-500 text-white text-[10px] font-bold rounded-full">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search */}
                    {tab === "search" && (
                        <div className="relative">
                            {searching ? (
                                <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />
                            ) : (
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            )}
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-zinc-800/50 rounded-xl text-sm text-white placeholder-zinc-500 outline-none border border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 transition-all"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-4 pb-4 max-h-[400px] overflow-y-auto min-h-[200px]">
                    {tab === "search" ? (
                        <>
                            {users.length === 0 && !searching ? (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                    <Search size={36} className="mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No users found</p>
                                    <p className="text-xs mt-1">Try searching with a different name or email</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {users.map((user, i) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition-all animate-fade-in"
                                            style={{ animationDelay: `${i * 0.04}s` }}
                                        >
                                            {/* Avatar */}
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                                {user.avatar && (user.avatar.startsWith("/") || user.avatar.startsWith("http")) ? (
                                                    <img
                                                        src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    user.avatar
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-semibold truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>

                                            {/* Action */}
                                            {user.status === "friends" ? (
                                                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs font-medium">
                                                    <UserCheck size={14} /> Friends
                                                </span>
                                            ) : user.status === "pending" ? (
                                                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                                                    <Clock size={14} /> Pending
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSendRequest(user.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 hover:bg-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <UserPlus size={14} /> Add
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Pending Requests */
                        <>
                            {loadingRequests ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-violet-500" size={32} />
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                    <Clock size={36} className="mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No pending requests</p>
                                    <p className="text-xs mt-1">All caught up!</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {pendingRequests.map((req, i) => (
                                        <div
                                            key={req.id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition-all animate-fade-in"
                                            style={{ animationDelay: `${i * 0.04}s` }}
                                        >
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                                {req.from.avatar && (req.from.avatar.startsWith("/") || req.from.avatar.startsWith("http")) ? (
                                                    <img
                                                        src={req.from.avatar.startsWith("http") ? req.from.avatar : `http://localhost:5000${req.from.avatar}`}
                                                        alt={req.from.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    req.from.avatar
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-semibold truncate">
                                                    {req.from.name}
                                                </p>
                                                <p className="text-[11px] text-zinc-500">
                                                    {req.from.email} · {req.time}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleAction(req.id, req.from.id, "accept")}
                                                    className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-semibold border border-violet-500/30 hover:bg-violet-500/30 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, req.from.id, "reject")}
                                                    className="px-3 py-1.5 rounded-lg text-zinc-500 text-xs font-medium hover:bg-zinc-800 hover:text-zinc-300 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

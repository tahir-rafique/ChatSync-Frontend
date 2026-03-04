"use client";
import React, { useState } from "react";
import {
    X,
    MessageCircle,
    UserMinus,
    MoreVertical,
    Search,
    Users,
    Circle,
    Clock,
} from "lucide-react";

export interface Friend {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    lastSeen?: string;
    status?: string;
    mutualFriends?: number;
}

interface FriendsPanelProps {
    friends: Friend[];
    onClose: () => void;
    onStartChat: (friendId: string) => void;
    onRemoveFriend: (friendId: string) => void;
}

export default function FriendsPanel({
    friends,
    onClose,
    onStartChat,
    onRemoveFriend,
}: FriendsPanelProps) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<"all" | "online">("all");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const filtered = friends
        .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        .filter((f) => (tab === "online" ? f.online : true));

    const onlineCount = friends.filter((f) => f.online).length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/50 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Users size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Friends</h2>
                                <p className="text-xs text-zinc-500">
                                    {friends.length} friends · {onlineCount} online
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

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-800/50 rounded-xl text-sm text-white placeholder-zinc-500 outline-none border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800 transition-all"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mt-3">
                        <button
                            onClick={() => setTab("all")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === "all"
                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            All ({friends.length})
                        </button>
                        <button
                            onClick={() => setTab("online")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === "online"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                            Online ({onlineCount})
                        </button>
                    </div>
                </div>

                {/* Friends List */}
                <div className="px-4 pb-12 max-h-[400px] overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                            <Users size={36} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">No friends found</p>
                            <p className="text-xs mt-1">
                                {search ? "Try a different search" : "Add some friends to get started"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((friend, i) => (
                                <div
                                    key={friend.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition-all group animate-fade-in relative"
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                            {friend.avatar && (friend.avatar.startsWith("/") || friend.avatar.startsWith("http")) ? (
                                                <img
                                                    src={friend.avatar.startsWith("http") ? friend.avatar : `http://localhost:5000${friend.avatar}`}
                                                    alt={friend.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                friend.avatar
                                            )}
                                        </div>
                                        {friend.online ? (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                                        ) : (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-600 rounded-full border-2 border-zinc-900" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-semibold truncate">
                                            {friend.name}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 truncate">
                                            {friend.online ? (
                                                <span className="text-emerald-400">
                                                    {friend.status || "Active now"}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    Last seen {friend.lastSeen || "recently"}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className={`flex items-center gap-1 transition-opacity ${menuOpen === friend.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                        <button
                                            onClick={() => onStartChat(friend.id)}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                                            title="Send message"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setMenuOpen(menuOpen === friend.id ? null : friend.id)
                                                }
                                                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {menuOpen === friend.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700/50 rounded-xl p-1 shadow-2xl shadow-black/50 z-50 min-w-[140px] animate-scale-in">
                                                    <button
                                                        onClick={() => {
                                                            onStartChat(friend.id);
                                                            setMenuOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                                                    >
                                                        <MessageCircle size={14} /> Message
                                                    </button>
                                                    <div className="border-t border-zinc-700/50 my-1" />
                                                    <button
                                                        onClick={() => {
                                                            onRemoveFriend(friend.id);
                                                            setMenuOpen(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    >
                                                        <UserMinus size={14} /> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useState } from "react";
import {
    MessageCircle,
    Users,
    UserPlus,
    Search,
    LogOut,
    Settings,
    Bell,
    Moon,
    Sun,
    Pin,
    Archive,
} from "lucide-react";

// Types
export interface ChatUser {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    typing?: boolean;
    pinned?: boolean;
}

interface SidebarProps {
    user: any;
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenFriends: () => void;
    onOpenAddFriend: () => void;
    onOpenProfile: () => void;
    onLogout: () => void;
    chats: ChatUser[];
}

export default function Sidebar({
    user,
    activeChat,
    onSelectChat,
    onOpenFriends,
    onOpenAddFriend,
    onOpenProfile,
    onLogout,
    chats,
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [darkMode, setDarkMode] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "pinned">("all");

    const filteredChats = chats
        .filter((chat) => {
            if (filter === "unread") return chat.unread > 0;
            if (filter === "pinned") return chat.pinned;
            return true;
        })
        .filter((chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const pinnedChats = filteredChats.filter((c) => c.pinned);
    const regularChats = filteredChats.filter((c) => !c.pinned);

    return (
        <aside className="w-80 h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-r border-zinc-800/50 relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 pb-3 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">
                                ChatSync
                            </h1>
                            <p className="text-[11px] text-zinc-500 font-medium">
                                {chats.filter((c) => c.online).length} online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all relative"
                            title="Notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all"
                            title="Toggle theme"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-800/50 rounded-xl text-sm text-white placeholder-zinc-500 outline-none border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800 transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 mt-3">
                    {(["all", "unread", "pinned"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f
                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 relative z-10">
                {pinnedChats.length > 0 && (
                    <div className="px-3 py-2 flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                        <Pin size={12} />
                        Pinned
                    </div>
                )}
                {pinnedChats.map((chat, i) => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        active={activeChat === chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        index={i}
                    />
                ))}

                {regularChats.length > 0 && pinnedChats.length > 0 && (
                    <div className="px-3 py-2 mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                        <Archive size={12} />
                        Recent
                    </div>
                )}
                {regularChats.map((chat, i) => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        active={activeChat === chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        index={i + pinnedChats.length}
                    />
                ))}

                {filteredChats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <Search size={32} className="mb-3 opacity-40" />
                        <p className="text-sm font-medium">No conversations found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-zinc-800/50 relative z-10">
                <div className="flex items-center gap-1">
                    <button
                        onClick={onOpenFriends}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all group"
                    >
                        <Users
                            size={18}
                            className="group-hover:text-violet-400 transition-colors"
                        />
                        <span className="hidden sm:inline">Friends</span>
                    </button>
                    <button
                        onClick={onOpenAddFriend}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all group"
                    >
                        <UserPlus
                            size={18}
                            className="group-hover:text-emerald-400 transition-colors"
                        />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>

                {/* User Profile Mini */}
                <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-inner">
                            {user?.avatar && (user.avatar.startsWith("/") || user.avatar.startsWith("http")) ? (
                                <img
                                    src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold">
                                    {user?.name?.[0].toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900 shadow-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] text-zinc-500">Online</p>
                    </div>
                    <button
                        onClick={onOpenProfile}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700/50 transition-all"
                        title="Profile Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

// ===== Chat Item =====
function ChatItem({
    chat,
    active,
    onClick,
    index,
}: {
    chat: ChatUser;
    active: boolean;
    onClick: () => void;
    index: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-0.5 text-left transition-all animate-fade-in group ${active
                ? "bg-violet-500/15 border border-violet-500/20"
                : "hover:bg-zinc-800/60 border border-transparent"
                }`}
            style={{ animationDelay: `${index * 0.03}s` }}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div
                    className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold ${active
                        ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20"
                        : "bg-gradient-to-br from-zinc-600 to-zinc-700"
                        }`}
                >
                    {chat.avatar && (chat.avatar.startsWith("/") || chat.avatar.startsWith("http")) ? (
                        <img
                            src={chat.avatar.startsWith("http") ? chat.avatar : `http://localhost:5000${chat.avatar}`}
                            alt={chat.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        chat.avatar
                    )}
                </div>
                {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span
                        className={`text-sm font-semibold truncate ${active ? "text-violet-300" : "text-zinc-200"
                            }`}
                    >
                        {chat.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex-shrink-0 ml-2">
                        {chat.time}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    {chat.typing ? (
                        <span className="text-xs text-violet-400 italic flex items-center gap-1">
                            typing
                            <span className="flex gap-0.5">
                                <span
                                    className="w-1 h-1 bg-violet-400 rounded-full"
                                    style={{ animation: "pulse-dot 1.2s 0s infinite" }}
                                />
                                <span
                                    className="w-1 h-1 bg-violet-400 rounded-full"
                                    style={{ animation: "pulse-dot 1.2s 0.2s infinite" }}
                                />
                                <span
                                    className="w-1 h-1 bg-violet-400 rounded-full"
                                    style={{ animation: "pulse-dot 1.2s 0.4s infinite" }}
                                />
                            </span>
                        </span>
                    ) : (
                        <span className="text-xs text-zinc-500 truncate">
                            {chat.lastMessage}
                        </span>
                    )}
                    {chat.unread > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 min-w-[20px] text-center bg-violet-500 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                            {chat.unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

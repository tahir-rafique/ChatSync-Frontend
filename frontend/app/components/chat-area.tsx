"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Paperclip,
    Smile,
    Mic,
    Video,
    Image as ImageIcon,
    File,
    X,
    Phone,
    VideoIcon,
    MoreVertical,
    ArrowLeft,
    Check,
    CheckCheck,
    Download,
    Play,
    Pause,
    Reply,
    Trash2,
    Copy,
    Forward,
} from "lucide-react";

// Types
export interface Attachment {
    id: string;
    type: "image" | "video" | "audio" | "file";
    name: string;
    size: string;
    url?: string;
    duration?: string;
}

export interface Message {
    id: string;
    text: string;
    sender: "me" | "other";
    time: string;
    status: "sent" | "delivered" | "read";
    attachment?: Attachment;
    replyTo?: { text: string; sender: string };
}

interface ChatAreaProps {
    chatName: string;
    chatAvatar: string;
    online: boolean;
    lastSeen?: string;
    messages: Message[];
    onSendMessage: (text: string, attachments?: File[]) => void;
    onBack?: () => void;
    onTyping?: (isTyping: boolean) => void;
    isTyping?: boolean;
}

const EMOJIS = ["😀", "😂", "❤️", "🔥", "👍", "🎉", "😎", "🤔", "💯", "✨", "😊", "🥳", "😍", "🙌", "💪", "🚀", "💜", "😅", "🤣", "👋"];

export default function ChatArea({
    chatName,
    chatAvatar,
    online,
    lastSeen,
    messages,
    onSendMessage,
    onBack,
    onTyping,
    isTyping,
}: ChatAreaProps) {
    const [input, setInput] = useState("");
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() && attachedFiles.length === 0) return;
        onSendMessage(input.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
        setInput("");
        setAttachedFiles([]);
        setReplyTo(null);
        setShowEmoji(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
        setShowAttachMenu(false);
    };

    const removeFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image")) return <ImageIcon size={14} />;
        if (type.startsWith("video")) return <VideoIcon size={14} />;
        if (type.startsWith("audio")) return <Mic size={14} />;
        return <File size={14} />;
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-zinc-950 relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 relative z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all sm:hidden"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20 overflow-hidden">
                            {chatAvatar && (chatAvatar.startsWith("/") || chatAvatar.startsWith("http")) ? (
                                <img
                                    src={chatAvatar.startsWith("http") ? chatAvatar : `http://localhost:5000${chatAvatar}`}
                                    alt={chatName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                chatAvatar
                            )}
                        </div>
                        {online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">{chatName}</h2>
                        <p className="text-[11px] text-zinc-500">
                            {isTyping ? (
                                <span className="text-violet-400 italic animate-pulse">Typing...</span>
                            ) : online ? (
                                <span className="text-emerald-400">Active now</span>
                            ) : (
                                `Last seen ${lastSeen || "recently"}`
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" title="Voice call">
                        <Phone size={18} />
                    </button>
                    <button className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" title="Video call">
                        <Video size={18} />
                    </button>
                    <button className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" title="More options">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 relative z-10">
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-1.5 bg-zinc-800/60 rounded-full border border-zinc-700/30">
                        <span className="text-[11px] text-zinc-400 font-medium">Today</span>
                    </div>
                </div>

                {messages.map((msg, i) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        showContextMenu={showContextMenu === msg.id}
                        onContextMenu={() => setShowContextMenu(showContextMenu === msg.id ? null : msg.id)}
                        onCloseContext={() => setShowContextMenu(null)}
                        onReply={() => { setReplyTo(msg); setShowContextMenu(null); }}
                        index={i}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmoji && (
                <div className="absolute bottom-20 left-5 bg-zinc-800 border border-zinc-700/50 rounded-2xl p-3 shadow-2xl shadow-black/50 z-30 animate-scale-in">
                    <div className="grid grid-cols-10 gap-1">
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => setInput((prev) => prev + emoji)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-colors text-lg"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Attach Menu */}
            {showAttachMenu && (
                <div className="absolute bottom-20 left-14 bg-zinc-800 border border-zinc-700/50 rounded-2xl p-2 shadow-2xl shadow-black/50 z-30 animate-scale-in">
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <ImageIcon size={16} className="text-emerald-400" />
                        </div>
                        Photo
                    </button>
                    <button
                        onClick={() => videoInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <VideoIcon size={16} className="text-blue-400" />
                        </div>
                        Video
                    </button>
                    <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Mic size={16} className="text-amber-400" />
                        </div>
                        Audio
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-700 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <File size={16} className="text-violet-400" />
                        </div>
                        File
                    </button>
                </div>
            )}

            {/* Hidden file inputs */}
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} multiple />
            <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} multiple />
            <input ref={videoInputRef} type="file" className="hidden" accept="video/*" onChange={handleFileSelect} multiple />
            <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleFileSelect} multiple />

            {/* Reply Preview */}
            {replyTo && (
                <div className="px-5 py-2 bg-zinc-900/80 border-t border-zinc-800/50 flex items-center gap-3 relative z-10 animate-slide-up">
                    <div className="w-1 h-10 bg-violet-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-violet-400 font-semibold">
                            Replying to {replyTo.sender === "me" ? "yourself" : chatName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{replyTo.text || "Attachment"}</p>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
                <div className="px-5 py-2 bg-zinc-900/80 border-t border-zinc-800/50 flex gap-2 overflow-x-auto relative z-10">
                    {attachedFiles.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-xl border border-zinc-700/50 animate-scale-in flex-shrink-0"
                        >
                            <div className="text-violet-400">{getFileIcon(file.type)}</div>
                            <span className="text-xs text-zinc-300 max-w-[120px] truncate">
                                {file.name}
                            </span>
                            <button
                                onClick={() => removeFile(i)}
                                className="p-0.5 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50 relative z-10">
                <div className="flex items-end gap-2">
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => { setShowEmoji(!showEmoji); setShowAttachMenu(false); }}
                            className={`p-2.5 rounded-xl transition-all ${showEmoji
                                ? "text-violet-400 bg-violet-500/10"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                }`}
                        >
                            <Smile size={20} />
                        </button>
                        <button
                            onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmoji(false); }}
                            className={`p-2.5 rounded-xl transition-all ${showAttachMenu
                                ? "text-violet-400 bg-violet-500/10"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                }`}
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                if (onTyping) {
                                    if (!isTypingRef.current) {
                                        isTypingRef.current = true;
                                        onTyping(true);
                                    }
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        isTypingRef.current = false;
                                        onTyping(false);
                                    }, 2000);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-2.5 bg-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-500 outline-none border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800 transition-all resize-none"
                            style={{ minHeight: "42px", maxHeight: "120px" }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                            }}
                        />
                    </div>

                    {input.trim() || attachedFiles.length > 0 ? (
                        <button
                            onClick={handleSend}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    ) : (
                        <button className="p-2.5 rounded-xl text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                            <Mic size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Click outside to close menus */}
            {(showEmoji || showAttachMenu || showContextMenu) && (
                <div
                    className="absolute inset-0 z-20"
                    onClick={() => {
                        setShowEmoji(false);
                        setShowAttachMenu(false);
                        setShowContextMenu(null);
                    }}
                />
            )}
        </div>
    );
}

// ===== Message Bubble =====
function MessageBubble({
    message,
    showContextMenu,
    onContextMenu,
    onCloseContext,
    onReply,
    index,
}: {
    message: Message;
    showContextMenu: boolean;
    onContextMenu: () => void;
    onCloseContext: () => void;
    onReply: () => void;
    index: number;
}) {
    const isMe = message.sender === "me";

    const StatusIcon = () => {
        if (!isMe) return null;
        if (message.status === "read") return <CheckCheck size={14} className="text-violet-400" />;
        if (message.status === "delivered") return <CheckCheck size={14} className="text-zinc-500" />;
        return <Check size={14} className="text-zinc-500" />;
    };

    return (
        <div
            className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1 group relative animate-fade-in`}
            style={{ animationDelay: `${index * 0.02}s` }}
        >
            <div
                className={`relative max-w-[70%] ${isMe ? "order-1" : ""}`}
                onContextMenu={(e) => { e.preventDefault(); onContextMenu(); }}
            >
                {/* Reply reference */}
                {message.replyTo && (
                    <div
                        className={`mb-1 px-3 py-2 rounded-t-xl ${isMe ? "bg-violet-500/10 border-l-2 border-violet-500" : "bg-zinc-800/80 border-l-2 border-zinc-500"
                            }`}
                    >
                        <p className="text-[10px] text-violet-400 font-semibold">{message.replyTo.sender}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{message.replyTo.text}</p>
                    </div>
                )}

                {/* Attachment */}
                {message.attachment && (
                    <AttachmentPreview attachment={message.attachment} isMe={isMe} />
                )}

                {/* Text bubble */}
                {message.text && (
                    <div
                        className={`px-4 py-2.5 ${isMe
                            ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl rounded-br-md shadow-lg shadow-violet-500/10"
                            : "bg-zinc-800/80 text-zinc-200 rounded-2xl rounded-bl-md border border-zinc-700/30"
                            } ${message.attachment ? "rounded-t-md" : ""}`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-violet-200/60" : "text-zinc-500"}`}>
                            <span className="text-[10px]">{message.time}</span>
                            <StatusIcon />
                        </div>
                    </div>
                )}

                {/* Context menu */}
                {showContextMenu && (
                    <div
                        className={`absolute top-0 ${isMe ? "right-full mr-2" : "left-full ml-2"} bg-zinc-800 border border-zinc-700/50 rounded-xl p-1 shadow-2xl shadow-black/50 z-40 animate-scale-in min-w-[140px]`}
                    >
                        <button onClick={onReply} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Reply size={14} /> Reply
                        </button>
                        <button onClick={onCloseContext} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Copy size={14} /> Copy
                        </button>
                        <button onClick={onCloseContext} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Forward size={14} /> Forward
                        </button>
                        <div className="border-t border-zinc-700/50 my-1" />
                        <button onClick={onCloseContext} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}

                {/* Hover reply button */}
                <button
                    onClick={onReply}
                    className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"
                        } opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all`}
                >
                    <Reply size={14} />
                </button>
            </div>
        </div>
    );
}

// ===== Attachment Preview =====
function AttachmentPreview({ attachment, isMe }: { attachment: Attachment; isMe: boolean }) {
    const [playing, setPlaying] = useState(false);

    if (attachment.type === "image") {
        return (
            <div className={`rounded-2xl ${isMe ? "rounded-br-md" : "rounded-bl-md"} overflow-hidden mb-0.5`}>
                <div className="w-64 h-48 bg-zinc-800 flex items-center justify-center relative group cursor-pointer">
                    {attachment.url ? (
                        <img
                            src={attachment.url.startsWith('http') ? attachment.url : `http://localhost:5000${attachment.url}`}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ImageIcon size={40} className="text-zinc-600" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <Download
                            size={20}
                            className="text-white opacity-0 group-hover:opacity-100 transition-all"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (attachment.type === "video") {
        return (
            <div className={`rounded-2xl ${isMe ? "rounded-br-md" : "rounded-bl-md"} overflow-hidden mb-0.5`}>
                <div className="w-64 h-40 bg-zinc-800 flex items-center justify-center relative cursor-pointer group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play size={20} className="text-white ml-0.5" />
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-[11px] text-white/80">{attachment.name}</span>
                        <span className="text-[11px] text-white/60">{attachment.duration || "0:30"}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (attachment.type === "audio") {
        return (
            <div className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-violet-600/30" : "bg-zinc-800/80"} rounded-2xl ${isMe ? "rounded-br-md" : "rounded-bl-md"} mb-0.5 min-w-[240px] border ${isMe ? "border-violet-500/20" : "border-zinc-700/30"}`}>
                <button
                    onClick={() => setPlaying(!playing)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? "bg-violet-500" : "bg-zinc-700"
                        }`}
                >
                    {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full ${isMe ? "bg-violet-300/50" : "bg-zinc-500/50"}`}
                                style={{ height: `${((i * 7) % 16) + 4}px` }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">{attachment.duration || "0:45"}</span>
                </div>
            </div>
        );
    }

    // File
    return (
        <div className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-violet-600/20" : "bg-zinc-800/80"} rounded-2xl ${isMe ? "rounded-br-md" : "rounded-bl-md"} mb-0.5 border ${isMe ? "border-violet-500/20" : "border-zinc-700/30"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMe ? "bg-violet-500/30" : "bg-zinc-700"}`}>
                <File size={20} className={isMe ? "text-violet-300" : "text-zinc-400"} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate font-medium">{attachment.name}</p>
                <p className="text-[11px] text-zinc-500">{attachment.size}</p>
            </div>
            <button className={`p-2 rounded-lg ${isMe ? "text-violet-300 hover:bg-violet-500/20" : "text-zinc-400 hover:bg-zinc-700"} transition-all`}>
                <Download size={16} />
            </button>
        </div>
    );
}

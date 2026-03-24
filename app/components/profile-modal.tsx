"use client";
import React, { useState, useRef } from "react";
import { X, Camera, User, Phone, Mail, Check, Loader2 } from "lucide-react";
import { apiRequest, BASE_URL } from "@/lib/api";

interface ProfileModalProps {
    user: any;
    onClose: () => void;
    onUpdate: (updatedUser: any) => void;
}

export default function ProfileModal({ user, onClose, onUpdate }: ProfileModalProps) {
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phone", phone);
            if (avatar) {
                formData.append("avatar", avatar);
            }

            // Using PATCH as it's often more compatible for partial updates
            const res = await apiRequest("/users/profile", {
                method: "PATCH",
                body: formData,
            });

            if (res.status === "success" || res.data?.user) {
                setSuccess(true);
                // Pass updated user directly — no extra API round-trip needed
                onUpdate(res.data.user || res.data);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 800);
            }
        } catch (err: any) {
            console.error("Profile update failed:", err);
            setError(err?.message || "Failed to save changes. Please check your connection.");
        } finally {
            setLoading(false);
        }

    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center animate-overlay-in px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="relative p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                        <p className="text-sm text-zinc-500 mt-1">Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-900 overflow-hidden ring-2 ring-violet-500/30">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview.startsWith("data:") || avatarPreview.startsWith("http")
                                                ? avatarPreview
                                                : `${BASE_URL}${avatarPreview}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-2xl font-bold">
                                            {name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-500 transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Enter your name"
                                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:bg-zinc-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:bg-zinc-800 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider opacity-50">
                                    Email Address
                                </label>
                                <div className="relative opacity-50">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full bg-zinc-800/30 border border-zinc-700/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-600 ml-1 italic">Email cannot be changed</p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${success
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-600/20 active:scale-[0.98]"
                                    } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : success ? (
                                    <>
                                        <Check size={18} /> Updated
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

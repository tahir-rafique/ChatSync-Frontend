"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            setSubmitted(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className="auth-card w-full max-w-[440px] rounded-2xl p-8 sm:p-10"
                style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                {!submitted ? (
                    <>
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))",
                                    border: "1px solid rgba(124, 58, 237, 0.2)",
                                }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#a78bfa"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Forgot password?
                            </h1>
                            <p className="text-sm text-white/50 leading-relaxed">
                                No worries! Enter your email and we&apos;ll send you
                                <br />a verification code to reset your password.
                            </p>
                        </div>

                        {/* Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="input-group">
                                <span className="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    id="forgot-email"
                                    disabled={loading}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className={`auth-btn flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                id="forgot-submit"
                                disabled={loading}
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? "Sending Code..." : "Send Verification Code"}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-white/40">
                            Remember your password?{" "}
                            <Link href="/login" className="auth-link">
                                Back to sign in
                            </Link>
                        </p>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="mb-6 flex justify-center">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(6, 182, 212, 0.2))",
                                    border: "1px solid rgba(34, 197, 94, 0.2)",
                                }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#4ade80"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 2 11 13" />
                                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Check your email
                            </h1>
                            <p className="text-sm text-white/50 leading-relaxed">
                                We&apos;ve sent a verification link to
                                <br />
                                <span className="text-white/70 font-medium">{email}</span>
                            </p>
                            <p className="mt-4 text-xs text-white/30">
                                Please check your inbox (and spam folder) for the reset link.
                            </p>
                        </div>

                        <Link href="/login">
                            <button type="button" className="auth-btn" id="forgot-continue">
                                Back to Login
                            </button>
                        </Link>

                        <p className="mt-6 text-center text-sm text-white/40">
                            Didn&apos;t receive the email?{" "}
                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="auth-link text-sm cursor-pointer bg-transparent border-none"
                            >
                                Try again
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

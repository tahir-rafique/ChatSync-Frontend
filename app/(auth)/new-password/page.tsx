"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export default function NewPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const strengthColor = [
        "transparent",
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#06b6d4",
    ];

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
                {!success ? (
                    <>
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))",
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
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Set new password
                            </h1>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Create a strong password for your account.
                                <br />
                                Must be at least 8 characters.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (password === confirmPassword && strength >= 2) {
                                    setSuccess(true);
                                }
                            }}
                        >
                            {/* New Password */}
                            <div>
                                <div className="input-group">
                                    <span className="input-icon">
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                width="18"
                                                height="11"
                                                x="3"
                                                y="11"
                                                rx="2"
                                                ry="2"
                                            />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="auth-input"
                                        style={{ paddingRight: "48px" }}
                                        placeholder="New password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        id="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors cursor-pointer"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Strength indicator */}
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex gap-1.5 mb-1.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className="h-1 flex-1 rounded-full transition-all duration-500"
                                                    style={{
                                                        background:
                                                            level <= strength
                                                                ? strengthColor[strength]
                                                                : "rgba(255,255,255,0.08)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p
                                            className="text-xs font-medium transition-colors duration-300"
                                            style={{ color: strengthColor[strength] }}
                                        >
                                            {strengthLabel[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="input-group">
                                <span className="input-icon">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </span>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="auth-input"
                                    style={{ paddingRight: "48px" }}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    id="confirm-new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors cursor-pointer"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirm ? (
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Password mismatch warning */}
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-400 flex items-center gap-1.5">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    Passwords do not match
                                </p>
                            )}

                            {/* Requirements */}
                            <div className="space-y-2 pt-1">
                                {[
                                    { label: "At least 8 characters", met: password.length >= 8 },
                                    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
                                    { label: "Contains number", met: /[0-9]/.test(password) },
                                    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
                                ].map((req) => (
                                    <div
                                        key={req.label}
                                        className="flex items-center gap-2 text-xs transition-colors duration-300"
                                        style={{
                                            color: password
                                                ? req.met
                                                    ? "rgba(34, 197, 94, 0.8)"
                                                    : "rgba(255, 255, 255, 0.3)"
                                                : "rgba(255, 255, 255, 0.25)",
                                        }}
                                    >
                                        {req.met ? (
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                            </svg>
                                        )}
                                        {req.label}
                                    </div>
                                ))}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="auth-btn"
                                id="new-password-submit"
                                disabled={password !== confirmPassword || strength < 2}
                                style={{
                                    opacity:
                                        password === confirmPassword && strength >= 2 ? 1 : 0.5,
                                    cursor:
                                        password === confirmPassword && strength >= 2
                                            ? "pointer"
                                            : "not-allowed",
                                }}
                            >
                                Reset Password
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div
                                    className="flex h-20 w-20 items-center justify-center rounded-full"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.15))",
                                        border: "2px solid rgba(34, 197, 94, 0.25)",
                                        animation: "fadeInUp 0.5s ease-out",
                                    }}
                                >
                                    <svg
                                        width="36"
                                        height="36"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#4ade80"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Password reset!
                            </h1>
                            <p className="mb-8 text-sm text-white/50 leading-relaxed">
                                Your password has been successfully reset.
                                <br />
                                You can now sign in with your new password.
                            </p>

                            <Link href="/login">
                                <button type="button" className="auth-btn" id="new-password-login">
                                    Back to Sign In
                                </button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

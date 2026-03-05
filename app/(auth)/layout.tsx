"use client";

import React from "react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section
            aria-label="auth-layout"
            className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)",
            }}
        >
            {/* Animated background orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
                        animation: "float 8s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute right-[-5%] bottom-[-10%] h-[400px] w-[400px] rounded-full opacity-20 blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
                        animation: "float 10s ease-in-out infinite reverse",
                    }}
                />
                <div
                    className="absolute top-[40%] left-[50%] h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
                    style={{
                        background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
                        animation: "float 12s ease-in-out infinite 2s",
                    }}
                />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Logo */}
            <div className="absolute top-8 left-8 z-10">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-white/90 tracking-wide">
                        ChatWave
                    </span>
                </Link>
            </div>

            {/* Main content */}
            <div className="relative z-10 w-full px-4">
                {children}
            </div>

            {/* Keyframe animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .auth-card {
                    animation: fadeInUp 0.6s ease-out;
                }
                .auth-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px 14px 48px;
                    color: white;
                    font-size: 15px;
                    width: 100%;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .auth-input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                }
                .auth-input:focus {
                    border-color: rgba(124, 58, 237, 0.6);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
                }
                .auth-btn {
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 14px;
                    font-size: 15px;
                    font-weight: 600;
                    width: 100%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .auth-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
                }
                .auth-btn:active {
                    transform: translateY(0);
                }
                .auth-btn::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s ease;
                }
                .auth-btn:hover::after {
                    left: 100%;
                }
                .social-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                }
                .social-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }
                .input-group {
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.35);
                    pointer-events: none;
                    transition: color 0.3s ease;
                    z-index: 1;
                }
                .input-group:focus-within .input-icon {
                    color: rgba(124, 58, 237, 0.8);
                }
                .auth-link {
                    color: #a78bfa;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }
                .auth-link:hover {
                    color: #c4b5fd;
                }
            `}</style>
        </section>
    );
}

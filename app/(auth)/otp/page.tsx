"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OtpPage() {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendTimer, setResendTimer] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.every((digit) => digit !== "")) {
            setIsVerifying(true);
            setTimeout(() => {
                router.push("/new-password");
            }, 1500);
        }
    };

    const isComplete = otp.every((digit) => digit !== "");

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
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Verify your email
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed">
                        Enter the 6-digit code we sent to your email
                    </p>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerify}>
                    <div className="mb-8 flex justify-center gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                id={`otp-input-${index}`}
                                className="h-14 w-12 rounded-xl text-center text-xl font-semibold text-white outline-none transition-all duration-300 sm:h-16 sm:w-14"
                                style={{
                                    background: digit
                                        ? "rgba(124, 58, 237, 0.15)"
                                        : "rgba(255, 255, 255, 0.05)",
                                    border: digit
                                        ? "1.5px solid rgba(124, 58, 237, 0.5)"
                                        : "1px solid rgba(255, 255, 255, 0.1)",
                                    boxShadow: digit
                                        ? "0 0 0 3px rgba(124, 58, 237, 0.1)"
                                        : "none",
                                    caretColor: "#a78bfa",
                                }}
                            />
                        ))}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="auth-btn"
                        id="otp-submit"
                        disabled={!isComplete || isVerifying}
                        style={{
                            opacity: isComplete && !isVerifying ? 1 : 0.5,
                            cursor: isComplete && !isVerifying ? "pointer" : "not-allowed",
                        }}
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            "Verify Code"
                        )}
                    </button>
                </form>

                {/* Resend */}
                <div className="mt-6 text-center">
                    {resendTimer > 0 ? (
                        <p className="text-sm text-white/40">
                            Resend code in{" "}
                            <span className="text-white/70 font-medium tabular-nums">
                                00:{resendTimer.toString().padStart(2, "0")}
                            </span>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setResendTimer(59)}
                            className="auth-link text-sm cursor-pointer bg-transparent border-none"
                        >
                            Resend verification code
                        </button>
                    )}
                </div>

                {/* Back */}
                <p className="mt-4 text-center text-sm text-white/40">
                    <Link href="/forgot-password" className="auth-link">
                        ← Back to forgot password
                    </Link>
                </p>
            </div>
        </div>
    );
}

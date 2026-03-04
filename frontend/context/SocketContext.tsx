"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, payload: any) => void;
    on: (type: string, handler: (payload: any) => void) => void;
    off: (type: string, handler: (payload: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef<Record<string, Set<(payload: any) => void>>>({});

    const connect = useCallback(() => {
        if (socketRef.current) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//localhost:5000/ws`;

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("🚀 WebSocket connected");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                if (handlersRef.current[type]) {
                    handlersRef.current[type].forEach((handler) => handler(payload));
                }
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };

        ws.onclose = () => {
            console.log("🔌 WebSocket disconnected");
            setIsConnected(false);
            socketRef.current = null;
            // Attempt to reconnect after 3 seconds
            if (isAuthenticated) {
                setTimeout(connect, 3000);
            }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error", err);
            ws.close();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && !socketRef.current) {
            connect();
        } else if (!isAuthenticated && socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, connect]);

    const sendMessage = (type: string, payload: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        }
    };

    const on = (type: string, handler: (payload: any) => void) => {
        if (!handlersRef.current[type]) {
            handlersRef.current[type] = new Set();
        }
        handlersRef.current[type].add(handler);
    };

    const off = (type: string, handler: (payload: any) => void) => {
        if (handlersRef.current[type]) {
            handlersRef.current[type].delete(handler);
        }
    };

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                sendMessage,
                on,
                off,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

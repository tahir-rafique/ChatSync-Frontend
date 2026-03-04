"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { apiRequest } from "@/lib/api";
import Sidebar, { type ChatUser } from "../components/sidebar";
import ChatArea, { type Message } from "../components/chat-area";
import FriendsPanel, { type Friend } from "../components/friends-panel";
import AddFriendModal from "../components/add-friend-modal";
import ProfileModal from "../components/profile-modal";
import LogoutConfirmationModal from "../components/logout-confirmation-modal";
import EmptyState from "../components/empty-state";

// ===== Mock Functions for Messages (Keeping them for UI demo) =====
const generateMessages = (chatId: string): Message[] => {
  return [
    { id: "m1", text: "Hey there! 👋", sender: "other", time: "Earlier", status: "read" },
    { id: "m2", text: "Hi! How are you?", sender: "me", time: "Earlier", status: "read" },
    { id: "m3", text: "Start a conversation!", sender: "other", time: "Earlier", status: "read" },
  ];
};

// ===== Dashboard Page =====
export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { on, off } = useSocket();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});

  // Listen for profile updates via socket
  useEffect(() => {
    const handleProfileUpdate = (payload: any) => {
      const { userId, name, avatar } = payload;

      // Update sidebar chats
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === userId
            ? {
              ...chat,
              name: name || chat.name,
              avatar: avatar || chat.avatar
            }
            : chat
        )
      );

      // Update friends panel
      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === userId
            ? {
              ...friend,
              name: name || friend.name,
              avatar: avatar || friend.avatar
            }
            : friend
        )
      );

      // If it's the current user, refresh our auth state
      if (user?.id === userId) {
        refreshUser(payload);
      }
    };

    on("PROFILE_UPDATED", handleProfileUpdate);
    return () => off("PROFILE_UPDATED", handleProfileUpdate);
  }, [user?.id, on, off, refreshUser]);

  const fetchUsers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiRequest("/users/friends");
      const formattedUsers: ChatUser[] = res.data.friends.map((f: any) => ({
        id: f._id,
        name: f.name,
        avatar: f.avatar || f.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        lastMessage: "Start a conversation!",
        time: f.isOnline ? "now" : "offline",
        unread: 0,
        online: f.isOnline,
        pinned: false
      }));
      setChats(formattedUsers);
    } catch (err) {
      console.error("Failed to fetch friends for sidebar:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiRequest("/users/friends");
      const formatted: Friend[] = res.data.friends.map((f: any) => ({
        id: f._id,
        name: f.name,
        avatar: f.avatar || f.name[0].toUpperCase(),
        online: f.isOnline,
        lastSeen: f.isOnline ? "now" : new Date(f.lastSeen).toLocaleDateString(),
        status: f.isOnline ? "Active now" : "Offline",
      }));
      setFriends(formatted);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, [fetchUsers, fetchFriends]);

  const activeChatData = chats.find((c) => c.id === activeChat);

  const getMessages = useCallback((chatId: string): Message[] => {
    if (allMessages[chatId]) return allMessages[chatId];
    return generateMessages(chatId);
  }, [allMessages]);

  const handleSendMessage = useCallback((text: string, attachments?: File[]) => {
    if (!activeChat) return;

    const newMessages: Message[] = [];

    // Handle attachments
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, i) => {
        let type: "image" | "video" | "audio" | "file" = "file";
        if (file.type.startsWith("image")) type = "image";
        else if (file.type.startsWith("video")) type = "video";
        else if (file.type.startsWith("audio")) type = "audio";

        newMessages.push({
          id: `new-${Date.now()}-att-${i}`,
          text: "",
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
          attachment: {
            id: `att-${Date.now()}-${i}`,
            type,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          },
        });
      });
    }

    // Handle text
    if (text) {
      newMessages.push({
        id: `new-${Date.now()}-text`,
        text,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      });
    }

    setAllMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || generateMessages(activeChat)), ...newMessages],
    }));

    // Update last message in sidebar
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat
          ? { ...c, lastMessage: text || "Sent an attachment", time: "now" }
          : c
      )
    );
  }, [activeChat]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
    // Clear unread
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0, typing: false } : c))
    );
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
  };

  return (
    <main className="flex h-screen overflow-hidden bg-zinc-950 font-sans">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onOpenFriends={() => setShowFriends(true)}
        onOpenAddFriend={() => setShowAddFriend(true)}
        onOpenProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
        chats={chats}
      />

      {/* Main Area */}
      {activeChat && activeChatData ? (
        <ChatArea
          chatName={activeChatData.name}
          chatAvatar={activeChatData.avatar}
          online={activeChatData.online}
          messages={getMessages(activeChat)}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChat(null)}
        />
      ) : (
        <EmptyState
          onOpenFriends={() => setShowFriends(true)}
          onOpenAddFriend={() => setShowAddFriend(true)}
        />
      )}

      {/* Modals */}
      {showFriends && (
        <FriendsPanel
          friends={friends}
          onClose={() => setShowFriends(false)}
          onStartChat={(friendId) => {
            setShowFriends(false);
            handleSelectChat(friendId);
          }}
          onRemoveFriend={async (friendId) => {
            try {
              await apiRequest(`/users/friends/${friendId}`, { method: "DELETE" });
              fetchFriends();
            } catch (err) {
              console.error("Failed to remove friend:", err);
            }
          }}
        />
      )}

      {showAddFriend && (
        <AddFriendModal
          onClose={() => {
            setShowAddFriend(false);
          }}
          onRefresh={() => {
            fetchUsers();
            fetchFriends();
          }}
        />
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={refreshUser}
        />
      )}

      {showLogoutModal && (
        <LogoutConfirmationModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />
      )}
    </main>
  );
}

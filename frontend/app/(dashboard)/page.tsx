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



// ===== Dashboard Page =====
export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const { on, off, sendMessage } = useSocket();
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

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiRequest("/chat/conversations");
      const formatted: ChatUser[] = res.data.conversations.map((c: any) => {
        const otherParticipant = c.participants.find((p: any) => p._id !== user.id);
        const name = c.isGroup ? c.groupName : (otherParticipant?.name || "Unknown");
        const avatar = c.isGroup ? c.groupAvatar : otherParticipant?.avatar;

        return {
          id: c._id,
          name,
          avatar: avatar || name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
          lastMessage: c.lastMessage?.content || (c.lastMessage ? `Sent an ${c.lastMessage.type}` : "Start a conversation!"),
          time: c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          unread: c.unreadCount?.[user.id] || 0,
          online: !c.isGroup && otherParticipant?.isOnline,
          pinned: false
        };
      });
      setChats(formatted);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await apiRequest(`/chat/conversations/${conversationId}/messages`);
      const formatted: Message[] = res.data.map((m: any) => ({
        id: m._id,
        text: m.content || "",
        sender: m.sender._id === user?.id ? "me" : "other",
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: m.readBy?.some((r: any) => r.user !== user?.id) ? "read" : "sent",
        attachment: m.fileUrl ? {
          id: m._id,
          type: m.type,
          name: m.fileName || "File",
          size: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
          url: m.fileUrl
        } : undefined
      }));
      setAllMessages(prev => ({ ...prev, [conversationId]: formatted }));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
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

    const handleNewMessage = (message: any) => {
      const { conversationId, content, sender, type, createdAt, fileUrl } = message;

      // Update messages for the active chat
      setAllMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), {
          id: message._id,
          text: content || "",
          sender: sender._id === user?.id ? "me" : "other",
          time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
          attachment: fileUrl ? {
            id: message._id,
            type: type,
            name: message.fileName || "File",
            size: message.fileSize ? `${(message.fileSize / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
            url: fileUrl
          } : undefined
        }]
      }));

      // Update last message in sidebar
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId
            ? {
              ...chat,
              lastMessage: content || `Sent an ${type}`,
              time: "now",
              unread: activeChat === conversationId ? 0 : (chat.unread || 0) + (sender._id === user?.id ? 0 : 1)
            }
            : chat
        )
      );
    };

    const handleTyping = ({ conversationId, userId, userName }: any, isTyping: boolean) => {
      if (userId === user?.id) return;
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId ? { ...chat, typing: isTyping } : chat
        )
      );
    };

    const handleFriendUpdate = () => {
      fetchFriends();
      fetchConversations();
    };

    on("NEW_MESSAGE", handleNewMessage);
    on("TYPING_START", (payload) => handleTyping(payload, true));
    on("TYPING_STOP", (payload) => handleTyping(payload, false));
    on("FRIEND_UPDATED", handleFriendUpdate);

    return () => {
      off("PROFILE_UPDATED", handleProfileUpdate);
      off("NEW_MESSAGE", handleNewMessage);
      off("TYPING_START", () => { });
      off("TYPING_STOP", () => { });
      off("FRIEND_UPDATED", handleFriendUpdate);
    };
  }, [user?.id, on, off, refreshUser, activeChat, fetchFriends, fetchConversations]);

  useEffect(() => {
    fetchConversations();
    fetchFriends();
  }, [fetchConversations, fetchFriends]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      sendMessage("JOIN_CONVERSATION", { conversationId: activeChat });
    }
    return () => {
      if (activeChat) sendMessage("LEAVE_CONVERSATION", { conversationId: activeChat });
    };
  }, [activeChat, fetchMessages, sendMessage]);

  const activeChatData = chats.find((c) => c.id === activeChat);

  const getMessages = useCallback((chatId: string): Message[] => {
    return allMessages[chatId] || [];
  }, [allMessages]);

  const handleSendMessage = useCallback(async (text: string, attachments?: File[]) => {
    if (!activeChat) return;

    try {
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append("file", file);
          await apiRequest(`/chat/conversations/${activeChat}/upload`, {
            method: "POST",
            body: formData,
          });
        }
      }

      if (text) {
        await apiRequest(`/chat/conversations/${activeChat}/messages`, {
          method: "POST",
          body: JSON.stringify({ content: text }),
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [activeChat]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChat(id);
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0, typing: false } : c))
    );
  }, []);

  const handleTypingStatus = useCallback((isTyping: boolean) => {
    if (!activeChat) return;
    sendMessage(isTyping ? "TYPING_START" : "TYPING_STOP", { conversationId: activeChat });
  }, [activeChat, sendMessage]);

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
          isTyping={activeChatData.typing}
          messages={getMessages(activeChat)}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChat(null)}
          onTyping={handleTypingStatus}
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
          onStartChat={async (friendId) => {
            try {
              const res = await apiRequest(`/chat/conversations/start/${friendId}`, { method: "POST" });
              const convoId = res.data.conversation._id;

              // Refresh conversations to show the new one if it's new
              fetchConversations();

              setShowFriends(false);
              handleSelectChat(convoId);
            } catch (err) {
              console.error("Failed to start chat:", err);
            }
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
            fetchConversations();
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

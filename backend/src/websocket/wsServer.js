const WebSocket = require("ws");
const { verifyToken } = require("../services/authService");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const logger = require("../utils/logger");

// ── State Maps ────────────────────────────────────────────
// userId → WebSocket client
const userSocketMap = new Map();
// conversationId → Set<userId>
const conversationRoomMap = new Map();

let wss = null;

// ── Init WebSocket Server ─────────────────────────────────
const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    try {
      const token = extractToken(req);
      if (!token) return ws.close(4001, "Unauthorized");

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("_id name friends");
      if (!user) return ws.close(4001, "User not found");

      ws.userId = user._id.toString();
      ws.user = user;
      ws.isAlive = true;

      userSocketMap.set(ws.userId, ws);

      // Mark user online
      await User.findByIdAndUpdate(user._id, { isOnline: true });

      logger.info(`🔌 WS connected: ${user.name} (${ws.userId})`);

      // Notify friends
      broadcastToFriends(user, { type: "USER_ONLINE", payload: { userId: ws.userId } });

      // Send initial ack
      safeSend(ws, { type: "CONNECTED", payload: { userId: ws.userId, message: "WebSocket connected" } });

      // ── Message Handler ───────────────────────────────
      ws.on("message", (raw) => handleMessage(ws, raw));

      // ── Ping/Pong ─────────────────────────────────────
      ws.on("pong", () => { ws.isAlive = true; });

      // ── Disconnect Handler ────────────────────────────
      ws.on("close", async () => {
        userSocketMap.delete(ws.userId);

        await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
        broadcastToFriends(user, {
          type: "USER_OFFLINE",
          payload: { userId: ws.userId, lastSeen: new Date() },
        });

        logger.info(`🔌 WS disconnected: ${user.name}`);
      });

      ws.on("error", (err) => logger.error(`WS error [${ws.userId}]:`, err));
    } catch (err) {
      logger.error("WS connection error:", err.message);
      ws.close(4001, "Unauthorized");
    }
  });

  // ── Heartbeat ─────────────────────────────────────────
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));
  logger.info("✅ WebSocket server initialized");
};

// ── Message Router ────────────────────────────────────────
const handleMessage = async (ws, raw) => {
  try {
    const data = JSON.parse(raw);
    const { type, payload } = data;

    switch (type) {
      case "JOIN_CONVERSATION":
        await handleJoinConversation(ws, payload);
        break;

      case "LEAVE_CONVERSATION":
        handleLeaveConversation(ws, payload);
        break;

      case "TYPING_START":
        handleTyping(ws, payload, "TYPING_START");
        break;

      case "TYPING_STOP":
        handleTyping(ws, payload, "TYPING_STOP");
        break;

      case "MESSAGE_READ":
        handleMessageRead(ws, payload);
        break;

      case "PING":
        safeSend(ws, { type: "PONG", payload: { timestamp: Date.now() } });
        break;

      default:
        safeSend(ws, { type: "ERROR", payload: { message: `Unknown event type: ${type}` } });
    }
  } catch (err) {
    logger.error("WS message parse error:", err.message);
    safeSend(ws, { type: "ERROR", payload: { message: "Invalid message format" } });
  }
};

// ── Join Conversation Room ────────────────────────────────
const handleJoinConversation = async (ws, payload) => {
  const { conversationId } = payload || {};
  if (!conversationId) return;

  // Validate participation
  const convo = await Conversation.findOne({ _id: conversationId, participants: ws.userId });
  if (!convo) {
    return safeSend(ws, { type: "ERROR", payload: { message: "Not a participant of this conversation" } });
  }

  if (!conversationRoomMap.has(conversationId)) {
    conversationRoomMap.set(conversationId, new Set());
  }
  conversationRoomMap.get(conversationId).add(ws.userId);
  ws.activeConversation = conversationId;

  safeSend(ws, { type: "JOINED_CONVERSATION", payload: { conversationId } });
};

// ── Leave Conversation Room ───────────────────────────────
const handleLeaveConversation = (ws, payload) => {
  const { conversationId } = payload || {};
  if (!conversationId) return;

  const room = conversationRoomMap.get(conversationId);
  if (room) room.delete(ws.userId);
  ws.activeConversation = null;

  safeSend(ws, { type: "LEFT_CONVERSATION", payload: { conversationId } });
};

// ── Typing Indicator ──────────────────────────────────────
const handleTyping = (ws, payload, eventType) => {
  const { conversationId } = payload || {};
  if (!conversationId) return;

  broadcastToConversation(
    conversationId,
    {
      type: eventType,
      payload: {
        conversationId,
        userId: ws.userId,
        userName: ws.user?.name,
      },
    },
    ws.userId // exclude self
  );
};

// ── Message Read Receipt ──────────────────────────────────
const handleMessageRead = (ws, payload) => {
  const { conversationId, messageId } = payload || {};
  if (!conversationId) return;

  broadcastToConversation(
    conversationId,
    {
      type: "MESSAGE_READ",
      payload: { conversationId, messageId, readBy: ws.userId },
    },
    ws.userId
  );
};

// ── Broadcast to Conversation Participants ─────────────────
const broadcastToConversation = async (conversationId, message, excludeUserId = null) => {
  try {
    const convo = await Conversation.findById(conversationId).select("participants");
    if (!convo) return;

    convo.participants.forEach((participantId) => {
      const pid = participantId.toString();
      if (excludeUserId && pid === excludeUserId) return;

      const clientWs = userSocketMap.get(pid);
      if (clientWs) safeSend(clientWs, message);
    });
  } catch (err) {
    logger.error("broadcastToConversation error:", err.message);
  }
};

// ── Broadcast to Friends ──────────────────────────────────
const broadcastToFriends = (user, message) => {
  if (!user.friends?.length) return;
  user.friends.forEach((friendId) => {
    const clientWs = userSocketMap.get(friendId.toString());
    if (clientWs) safeSend(clientWs, message);
  });
};

// ── Send to specific user ─────────────────────────────────
const sendToUser = (userId, message) => {
  const clientWs = userSocketMap.get(userId);
  if (clientWs) safeSend(clientWs, message);
};

// ── Safe JSON Send ────────────────────────────────────────
const safeSend = (ws, data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

// ── Extract token from request URL or Cookie ───────────────
const extractToken = (req) => {
  // 1. Try URL Query Param
  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryToken = url.searchParams.get("token");
  if (queryToken) return queryToken;

  // 2. Try Cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );
    return cookies.accessToken;
  }

  return null;
};

const getWss = () => wss;
const getOnlineUsers = () => [...userSocketMap.keys()];

module.exports = {
  initWebSocket,
  broadcastToConversation,
  broadcastToFriends,
  sendToUser,
  getWss,
  getOnlineUsers,
};

import { AppState, Platform } from "react-native";
import { API_URL } from "./api";

export type RealtimeEvent = {
  type:
    | "connected"
    | "pong"
    | "notification"
    | "notifications_sync"
    | "chat_message"
    | "chat_read"
    | "booking_update"
    | "agency_status"
    | "admin_update";
  conversationId?: string;
  bookingId?: string;
};

type EventHandler = (event: RealtimeEvent) => void;
type SyncHandler = () => void;

const BACKOFF_MS = [1500, 3000, 6000, 15000, 30000];
const PING_MS = 45000;

let ws: WebSocket | null = null;
let connected = false;
let currentToken: string | null = null;
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let needsResync = false;
let isForeground = true;

let onEvent: EventHandler | null = null;
let onResync: SyncHandler | null = null;

const wsUrl = () => `${API_URL.replace(/^http/i, "ws")}/ws`;

export const isWsConnected = () => connected;

export const setRealtimeHandlers = (handlers: {
  onEvent: EventHandler | null;
  onResync: SyncHandler | null;
}) => {
  onEvent = handlers.onEvent;
  onResync = handlers.onResync;
};

const clearTimers = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
};

const closeSocket = () => {
  clearTimers();
  connected = false;
  if (ws) {
    const old = ws;
    ws = null;
    old.onopen = null;
    old.onmessage = null;
    old.onerror = null;
    old.onclose = null;
    try {
      old.close();
    } catch {
      // yopishda xato bo'lsa e'tiborsiz qoldiramiz
    }
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer || !currentToken || !isForeground) return;
  const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
  attempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
};

const connect = () => {
  if (!currentToken || !isForeground) return;
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  const token = currentToken;
  const socket = new WebSocket(wsUrl());
  ws = socket;

  socket.onopen = () => {
    if (ws !== socket) return;
    try {
      socket.send(JSON.stringify({ type: "auth", token }));
    } catch {
      socket.close();
    }
  };

  socket.onmessage = (e) => {
    if (ws !== socket || typeof e.data !== "string") return;
    try {
      const msg = JSON.parse(e.data) as RealtimeEvent;
      if (!msg?.type) return;
      if (msg.type === "connected") {
        connected = true;
        attempt = 0;
        if (needsResync) {
          needsResync = false;
          onResync?.();
        }
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws === socket && socket.readyState === WebSocket.OPEN) {
            try {
              socket.send("ping");
            } catch {
              // onclose qayta ulaydi
            }
          }
        }, PING_MS);
        return;
      }
      if (msg.type !== "pong") {
        onEvent?.(msg);
      }
    } catch {
      // noto'g'ri JSON e'tiborsiz qoldiriladi
    }
  };

  socket.onerror = () => {
    // onclose ulanishni boshqaradi
  };

  socket.onclose = () => {
    if (ws !== socket) return;
    clearTimers();
    ws = null;
    connected = false;
    needsResync = true;
    scheduleReconnect();
  };
};

export const syncRealtimeToken = (token: string | null) => {
  if (token === currentToken) {
    if (token && !ws && isForeground) connect();
    return;
  }
  currentToken = token;
  attempt = 0;
  needsResync = false;
  closeSocket();
  if (token && isForeground) connect();
};

const setForeground = (active: boolean) => {
  if (active === isForeground) return;
  isForeground = active;
  if (!active) {
    if (ws || connected) needsResync = true;
    closeSocket();
  } else if (currentToken) {
    attempt = 0;
    connect();
  }
};

AppState.addEventListener("change", (state) => {
  setForeground(state === "active");
});

if (Platform.OS === "web" && typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    setForeground(document.visibilityState === "visible");
  });
}

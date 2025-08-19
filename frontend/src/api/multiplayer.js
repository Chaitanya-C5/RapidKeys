import axiosClient from "./api.js";

// Helper to get Authorization header. Reads from localStorage by default.
const getAuthHeaders = (tokenOverride) => {
  const token = tokenOverride || (typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null);  
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Centralized error normalizer
const normalizeError = (error) => {
  // Axios error shape
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message = (data && (data.message || data.detail)) || error.message || "Request failed";
    return { ok: false, status, message, data };
  }
  // Network or other errors
  return { ok: false, status: null, message: error?.message || "Network error", data: null };
};

// POST /api/v1/multiplayer/create-room
export const createRoom = async (settings = {}, tokenOverride) => {
  try {
    const res = await axiosClient.post(
      "/multiplayer/create-room",
      settings,
      { headers: { ...getAuthHeaders(tokenOverride) } }
    );
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return normalizeError(err);
  }
};

// GET /api/v1/multiplayer/room/{room_code}
export const getRoomInfo = async (roomCode, tokenOverride) => {
  try {
    const res = await axiosClient.get(
      `/multiplayer/room/${encodeURIComponent(roomCode)}`,
      { headers: { ...getAuthHeaders(tokenOverride) } }
    );
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return normalizeError(err);
  }
};

// GET /api/v1/multiplayer/active-rooms
export const getActiveRooms = async (tokenOverride) => {
  try {
    const res = await axiosClient.get(
      "/multiplayer/active-rooms",
      { headers: { ...getAuthHeaders(tokenOverride) } }
    );
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return normalizeError(err);
  }
};

// WebSocket connection for real-time multiplayer
export const connectToRoom = (roomCode, { onMessage, onOpen, onClose, onError }, tokenOverride) => {
  const token = tokenOverride || (typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null);
  
  if (!token) {
    console.error("No auth token available for WebSocket connection");
    return null;
  }

  // Get WebSocket URL from axios base URL
  const baseURL = axiosClient.defaults.baseURL || window.location.origin;
  const wsBaseURL = baseURL.replace(/^http/, 'ws');
  const wsUrl = `${wsBaseURL}/multiplayer/ws/${encodeURIComponent(roomCode)}?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = (event) => {
    console.log('WebSocket connected to room:', roomCode);
    onOpen?.(event);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  ws.onclose = (event) => {
    console.log('WebSocket disconnected from room:', roomCode);
    onClose?.(event);
  };

  ws.onerror = (event) => {
    console.error('WebSocket error:', event);
    onError?.(event);
  };

  // Return WebSocket instance with helper methods
  return {
    ws,
    send: (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      } else {
        console.warn('WebSocket not open, cannot send:', data);
      }
    },
    close: () => ws.close(),
    isOpen: () => ws.readyState === WebSocket.OPEN
  };
};

// Helper functions for common WebSocket messages
export const sendChatMessage = (wsConnection, message) => {
  wsConnection?.send({
    type: "chat_message",
    message: message.trim(),
    timestamp: new Date().toISOString()
  });
};

export const startRace = (wsConnection) => {
  wsConnection?.send({
    type: "start_race"
  });
};

export const sendTypingProgress = (wsConnection, progress, wpm) => {
  wsConnection?.send({
    type: "typing_progress",
    progress,
    wpm
  });
};

export default {
  createRoom,
  getRoomInfo,
  getActiveRooms,
  connectToRoom,
  sendChatMessage,
  startRace,
  sendTypingProgress,
};

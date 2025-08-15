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

export default {
  createRoom,
  getRoomInfo,
  getActiveRooms,
};

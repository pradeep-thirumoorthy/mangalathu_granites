import axios from "axios";

const BASE = "http://localhost:3010";

// Helper
async function request(method, url, body = {}) {
  try {
    const res = await axios({
      method,
      url: BASE + url,
      data: body,
      headers: { "Content-Type": "application/json" },
    });

    if (!res.data) throw new Error("Empty API response");

    return res.data;
  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
    throw err;
  }
}

/* ===============================
      SHOWROOM WORKERS
================================*/

// Showroom Clock-In
export async function showroomClockIn(userId, supervisorId) {
  return request("POST", "/att/showroom/clockin", {
    userId,
    supervisorId,
    timestamp: new Date().toISOString(),
  });
}

// Showroom Clock-Out
export async function showroomClockOut(userId, supervisorId, reason) {
  return request("POST", "/att/showroom/clockout", {
    userId,
    supervisorId,
    reason,
  });
}

/* ===============================
      WAREHOUSE WORKERS
================================*/

// New → Warehouse worker Clock-In
export async function warehouseClockIn(payload) {
  return request("POST", "/att/warehouse/clockin", payload);
}


// Warehouse Clock-Out


export async function warehouseClockOut(userId, supervisorId, reason, overtime) {
  return request("POST", "/att/warehouse/clockout", {
    userId,
    supervisorId,
    reason: reason || null,
    overtimeHours: overtime || 0,
    timestamp: new Date().toISOString()
  });
}


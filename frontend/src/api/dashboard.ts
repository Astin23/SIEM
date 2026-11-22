import { api } from "./axios";

export const fetchAlertStats = async () => {
  const response = await api.get("/api/alerts/stats");
  return response.data;
};

export const fetchEventStats = async () => {
  const response = await api.get("/api/events/stats");
  return response.data;
};

export const fetchRuleStats = async () => {
  const response = await api.get("/api/rules?limit=1");
  return response.data; // Expected { items: [], total: number, ... }
};

export const fetchRiskScore = async () => {
  try {
    const response = await api.get("/api/risk-scores/summary");
    return response.data;
  } catch (error) {
    // Graceful fallback if endpoint doesn't exist
    return { avg_score: 0.0 };
  }
};

export const fetchRecentAlerts = async (limit = 5) => {
  const response = await api.get(`/api/alerts?limit=${limit}`);
  return response.data; // Expected { items: [], total: number }
};

export const fetchLiveEvents = async (limit = 10) => {
  const response = await api.get(`/api/events?page=1&page_size=${limit}`);
  return response.data; // Expected { items: [], total: number }
};

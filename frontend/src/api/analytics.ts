import { api } from "./axios";

export interface SeverityThreat {
  name: string;
  count: number;
  color: string;
}

export interface TypeThreat {
  name: string;
  count: number;
}

export interface TopIp {
  ip: string;
  count: number;
  country?: string;
}

export interface TimelineData {
  date: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface PortTarget {
  port: number;
  count: number;
  service: string;
}

export const fetchThreatsBySeverity = async (): Promise<SeverityThreat[]> => {
  const response = await api.get("/api/threats/by-severity");
  return response.data;
};

export const fetchThreatsByType = async (): Promise<TypeThreat[]> => {
  const response = await api.get("/api/threats/by-type");
  return response.data;
};

export const fetchTopIps = async (limit = 10): Promise<TopIp[]> => {
  const response = await api.get(`/api/threats/top-ips?limit=${limit}`);
  return response.data;
};

export const fetchThreatTimeline = async (days = 30): Promise<TimelineData[]> => {
  const response = await api.get(`/api/threats/timeline?days=${days}`);
  return response.data;
};

export const fetchTopPorts = async (limit = 10): Promise<PortTarget[]> => {
  const response = await api.get(`/api/threats/top-ports?limit=${limit}`);
  return response.data;
};

import { api } from "./axios";

export interface AlertFilters {
  status?: string;
  severity?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const fetchAlerts = async (filters: AlertFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== "All") params.append("status", filters.status);
  if (filters.severity && filters.severity !== "All") params.append("severity", filters.severity);
  if (filters.search) params.append("search", filters.search);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.pageSize) params.append("page_size", filters.pageSize.toString());

  const response = await api.get(`/api/alerts?${params.toString()}`);
  return response.data;
};

export const fetchAlertDetail = async (id: string | number) => {
  const response = await api.get(`/api/alerts/${id}`);
  return response.data;
};

export const updateAlertStatus = async ({ id, action }: { id: string | number, action: 'acknowledge' | 'resolve' | 'close' | 'escalate' }) => {
  const response = await api.post(`/api/alerts/${id}/${action}`);
  return response.data;
};

export const assignAlert = async ({ id, assignee_id }: { id: string | number, assignee_id: number }) => {
  const response = await api.post(`/api/alerts/${id}/assign?assignee_id=${assignee_id}`);
  return response.data;
};

export const addAlertComment = async ({ id, content }: { id: string | number, content: string }) => {
  const response = await api.post(`/api/alerts/${id}/comments`, { content });
  return response.data;
};

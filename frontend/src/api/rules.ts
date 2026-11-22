import { api } from "./axios";

export interface DetectionRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  category?: string;
  conditions: any;
  created_at: string;
  updated_at: string;
}

export interface RuleFilters {
  enabled?: boolean | string;
  severity?: string;
  category?: string;
  priority?: string;
  search?: string;
  sort_by?: string;
  sort_desc?: boolean;
  page?: number;
  pageSize?: number;
}

export const fetchRules = async (filters: RuleFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.enabled !== undefined && filters.enabled !== "All") params.append("enabled", filters.enabled.toString());
  if (filters.severity && filters.severity !== "All") params.append("severity", filters.severity);
  if (filters.category && filters.category !== "All") params.append("category", filters.category);
  if (filters.priority && filters.priority !== "All") params.append("priority", filters.priority);
  if (filters.search) params.append("search", filters.search);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_desc !== undefined) params.append("sort_desc", filters.sort_desc.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.pageSize) params.append("page_size", filters.pageSize.toString());

  const response = await api.get(`/api/rules?${params.toString()}`);
  return response.data;
};

export const fetchRule = async (id: number | string) => {
  const response = await api.get(`/api/rules/${id}`);
  return response.data;
};

export const createRule = async (data: any) => {
  const response = await api.post(`/api/rules`, data);
  return response.data;
};

export const updateRule = async ({ id, data }: { id: number | string; data: any }) => {
  const response = await api.put(`/api/rules/${id}`, data);
  return response.data;
};

export const deleteRule = async (id: number | string) => {
  const response = await api.delete(`/api/rules/${id}`);
  return response.data;
};

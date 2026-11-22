import { api } from "./axios";

export interface IncidentHistory {
  id: number;
  actor_username?: string;
  action: string;
  old_value?: string;
  new_value?: string;
  details?: string;
  created_at: string;
}

export interface IncidentComment {
  id: number;
  author_username: string;
  content: string;
  created_at: string;
}

export interface IncidentResponse {
  id: number;
  title: string;
  severity: string;
  status: string;
  assigned_to_username?: string;
  source: string;
  source_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentDetailResponse extends IncidentResponse {
  description?: string;
  history: IncidentHistory[];
  comments: IncidentComment[];
}

export interface IncidentListResponse {
  alerts: IncidentResponse[]; // The backend key is 'alerts'
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IncidentFilters {
  status?: string;
  severity?: string;
  assigned_to?: number; // Backend supports this
  search?: string;
  page?: number;
  page_size?: number;
}

export const incidentsApi = {
  getIncidents: async (filters: IncidentFilters = {}): Promise<IncidentListResponse> => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "All") params.append("status", filters.status.toLowerCase());
    if (filters.severity && filters.severity !== "All") params.append("severity", filters.severity);
    if (filters.assigned_to) params.append("assigned_to", filters.assigned_to.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const { data } = await api.get<IncidentListResponse>(`/api/alerts?${params.toString()}`);
    return data;
  },

  getIncidentDetail: async (id: number): Promise<IncidentDetailResponse> => {
    const { data } = await api.get<IncidentDetailResponse>(`/api/alerts/${id}`);
    return data;
  },

  assignIncident: async (id: number, user_id: number): Promise<IncidentResponse> => {
    // API assigns via POST /api/alerts/{alert_id}/assign with JSON { "user_id": ... }
    const { data } = await api.post<IncidentResponse>(`/api/alerts/${id}/assign`, { user_id });
    return data;
  },
  
  updateIncidentStatus: async (id: number, action: "acknowledge" | "resolve" | "close" | "escalate"): Promise<IncidentResponse> => {
    // Standard actions via POST /api/alerts/{id}/{action}
    const { data } = await api.post<IncidentResponse>(`/api/alerts/${id}/${action}`);
    return data;
  }
};

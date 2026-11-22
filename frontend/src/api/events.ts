import { api } from "./axios";

export interface SecurityEventResponse {
  id: number;
  timestamp?: string;
  source_ip: string;
  destination_ip?: string;
  username?: string;
  event_type: string;
  login_status?: string;
  failed_attempts: number;
  destination_port?: number;
  protocol?: string;
  bytes_transferred: number;
  device_type?: string;
  country?: string;
  alert_type?: string;
  severity?: string;
  label?: string;
  risk_score: number;
  ml_prediction?: string;
  ml_confidence?: number;
  rule_triggered?: string;
  recommendation?: string;
  escalation: boolean;
}

export interface EventListResponse {
  events: SecurityEventResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FetchEventsParams {
  page?: number;
  page_size?: number;
  severity?: string;
  event_type?: string;
  source_ip?: string;
  label?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const fetchEvents = async (params: FetchEventsParams): Promise<EventListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  if (params.page_size !== undefined) queryParams.append("page_size", params.page_size.toString());
  if (params.severity) queryParams.append("severity", params.severity);
  if (params.event_type) queryParams.append("event_type", params.event_type);
  if (params.source_ip) queryParams.append("source_ip", params.source_ip);
  if (params.label) queryParams.append("label", params.label);
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);
  if (params.search) queryParams.append("search", params.search);

  const response = await api.get(`/api/events?${queryParams.toString()}`);
  return response.data;
};

export const fetchEventById = async (eventId: number): Promise<SecurityEventResponse> => {
  const response = await api.get(`/api/events/${eventId}`);
  return response.data;
};

import { api } from "./axios";

export interface AttackChainStageResponse {
  id: number;
  stage_number: number;
  attack_type?: string;
  timestamp?: string;
  description?: string;
  severity?: string;
}

export interface AttackChainResponse {
  id: number;
  name?: string;
  source_ip?: string;
  target_system?: string;
  username?: string;
  start_time?: string;
  end_time?: string;
  severity?: string;
  risk_score?: number;
  status: string;
  stages: AttackChainStageResponse[];
}

export interface AttackChainListResponse {
  chains: AttackChainResponse[];
  total: number;
}

export interface ChainFilterParams {
  search?: string;
  severity?: string;
  status?: string;
  limit?: number;
}

export const chainsApi = {
  getAttackChains: async (params?: ChainFilterParams): Promise<AttackChainListResponse> => {
    const { data } = await api.get<AttackChainListResponse>("/api/attack-chains", {
      params: { limit: 50, ...params },
    });
    return data;
  },
};

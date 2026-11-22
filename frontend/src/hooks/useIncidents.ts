import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentsApi } from "@/api/incidents";
import type { IncidentFilters } from "@/api/incidents";

export const useIncidents = (filters: IncidentFilters) => {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => incidentsApi.getIncidents(filters),
    refetchInterval: 30000,
  });
};

export const useIncidentDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: () => id ? incidentsApi.getIncidentDetail(id) : null,
    enabled: !!id,
  });
};

export const useUpdateIncidentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "acknowledge" | "resolve" | "close" | "escalate" }) => 
      incidentsApi.updateIncidentStatus(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.id] });
    },
  });
};

export const useAssignIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, user_id }: { id: number; user_id: number }) => 
      incidentsApi.assignIncident(id, user_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.id] });
    },
  });
};

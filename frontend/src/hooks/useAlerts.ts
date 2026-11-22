import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts, fetchAlertDetail, updateAlertStatus, assignAlert, addAlertComment } from "@/api/alerts";
import type { AlertFilters } from "@/api/alerts";

export const useAlertsQuery = (filters: AlertFilters) => {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => fetchAlerts(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new pages
  });
};

export const useAlertDetailQuery = (id: string | number) => {
  return useQuery({
    queryKey: ["alerts", id],
    queryFn: () => fetchAlertDetail(id),
    enabled: !!id,
  });
};

export const useUpdateAlertStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlertStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alerts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] }); // invalidate list
    },
  });
};

export const useAssignAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignAlert,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alerts", variables.id] });
    },
  });
};

export const useAddAlertComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAlertComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alerts", variables.id] });
    },
  });
};

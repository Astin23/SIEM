import { useQuery, useQueries } from "@tanstack/react-query";
import { 
  fetchAlertStats, 
  fetchEventStats, 
  fetchRuleStats, 
  fetchRiskScore, 
  fetchRecentAlerts, 
  fetchLiveEvents 
} from "@/api/dashboard";

export const useDashboardKPIs = () => {
  const results = useQueries({
    queries: [
      { queryKey: ["alertStats"], queryFn: fetchAlertStats },
      { queryKey: ["eventStats"], queryFn: fetchEventStats },
      { queryKey: ["ruleStats"], queryFn: fetchRuleStats },
      { queryKey: ["riskScore"], queryFn: fetchRiskScore },
    ],
  });

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  const [alertStats, eventStats, ruleStats, riskScore] = results;

  return {
    isLoading,
    isError,
    data: {
      alertStats: alertStats.data,
      eventStats: eventStats.data,
      ruleStats: ruleStats.data,
      riskScore: riskScore.data,
    },
    refetch: () => results.forEach(result => result.refetch())
  };
};

export const useRecentAlerts = (limit = 5) => {
  return useQuery({
    queryKey: ["recentAlerts", limit],
    queryFn: () => fetchRecentAlerts(limit),
  });
};

export const useLiveEvents = (limit = 10) => {
  return useQuery({
    queryKey: ["liveEvents", limit],
    queryFn: () => fetchLiveEvents(limit),
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });
};

import { useQuery } from "@tanstack/react-query";
import {
  fetchThreatsBySeverity,
  fetchThreatsByType,
  fetchTopIps,
  fetchThreatTimeline,
  fetchTopPorts,
} from "@/api/analytics";
import { fetchEventStats, fetchAlertStats, fetchRiskScore } from "@/api/dashboard";

export const useAnalyticsDashboardData = (days: number) => {
  return useQuery({
    queryKey: ["analyticsDashboard", days],
    queryFn: async () => {
      const [
        severityThreats,
        typeThreats,
        topIps,
        timeline,
        topPorts,
        eventStats,
        alertStats,
        riskScore,
      ] = await Promise.all([
        fetchThreatsBySeverity(),
        fetchThreatsByType(),
        fetchTopIps(10),
        fetchThreatTimeline(days),
        fetchTopPorts(10),
        fetchEventStats(),
        fetchAlertStats(),
        fetchRiskScore(),
      ]);

      return {
        severityThreats,
        typeThreats,
        topIps,
        timeline,
        topPorts,
        eventStats,
        alertStats,
        riskScore,
      };
    },
    refetchInterval: 30000, // Refresh every 30s
  });
};

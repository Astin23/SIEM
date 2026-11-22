import { formatDistanceToNow } from "date-fns";
import { useRecentAlerts } from "@/hooks/useDashboardData";
import { SectionHeader } from "@/components/ui-custom/SectionHeader";
import { LoadingSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-info text-info-foreground",
    low: "bg-success text-success-foreground",
  };
  return (
    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ${map[severity?.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
      {severity}
    </span>
  );
}

export function RecentAlertsList() {
  const { data, isLoading, isError } = useRecentAlerts(5);

  const alertsList = data?.alerts || data?.items || [];
  const hasNoAlerts = alertsList.length === 0;

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm p-6 flex flex-col h-[500px]">
      <SectionHeader 
        title="Recent Alerts" 
        action={
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
            <Link to="/dashboard/alerts">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <LoadingSkeleton type="list" />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-destructive">
            Failed to load alerts.
          </div>
        ) : hasNoAlerts ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground flex-col">
            <ShieldAlert className="h-8 w-8 mb-2 opacity-50" />
            No active alerts
          </div>
        ) : (
          alertsList.map((alert: any) => (
            <div key={alert.id} className="text-sm p-3 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="font-semibold text-foreground line-clamp-1 flex-1 pr-2">
                  {alert.title}
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>
              <div className="text-muted-foreground text-xs flex justify-between items-center">
                <span>{alert.source_ip || "Unknown"}</span>
                <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

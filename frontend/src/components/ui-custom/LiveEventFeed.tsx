import { formatDistanceToNow } from "date-fns";
import { RefreshCcw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui-custom/LoadingSkeleton";
import { useLiveEvents } from "@/hooks/useDashboardData";
import { SectionHeader } from "@/components/ui-custom/SectionHeader";

export function LiveEventFeed() {
  const { data, isLoading, isError, refetch, isFetching } = useLiveEvents(10);

  const eventsList = data?.events || data?.items || [];
  const hasNoEvents = eventsList.length === 0;

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm p-6 flex flex-col h-[500px]">
      <SectionHeader 
        title="Live Event Feed" 
        action={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="h-8"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <LoadingSkeleton type="list" />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-destructive">
            Failed to load events.
          </div>
        ) : hasNoEvents ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground flex-col">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            No recent events
          </div>
        ) : (
          eventsList.map((event: any) => (
            <div key={event.id} className="text-sm p-3 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-primary">{event.event_type}</span>
                <span className="text-xs text-muted-foreground">
                  {event.timestamp ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true }) : "Just now"}
                </span>
              </div>
              <div className="text-muted-foreground text-xs flex justify-between">
                <span>{event.source_ip} &rarr; {event.destination_ip}</span>
                {event.username && <span>User: {event.username}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

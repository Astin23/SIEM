import { useQuery } from "@tanstack/react-query";
import { fetchThreatTimeline, type TimelineData } from "@/api/analytics";
import { SectionHeader } from "@/components/ui-custom/SectionHeader";
import { Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, parseISO } from "date-fns";

export function EventTimelinePlaceholder() {
  const { data = [], isLoading } = useQuery<TimelineData[]>({
    queryKey: ["threatTimeline"],
    queryFn: () => fetchThreatTimeline(30),
    refetchInterval: 10000,
  });

  const formattedData = data.map((d) => ({
    ...d,
    formattedDate: d.date ? (d.date.length > 10 ? format(parseISO(d.date), "MMM dd HH:mm") : format(parseISO(d.date), "MMM dd")) : d.date,
  }));

  const hasData = formattedData.length > 0 && formattedData.some(d => d.count > 0);

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm p-6 flex flex-col h-[320px]">
      <SectionHeader title="Event Telemetry Timeline" />
      <div className="flex-1 min-h-0 mt-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading telemetry timeline...
          </div>
        ) : !hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/40 rounded-lg bg-muted/10 h-full space-y-2">
            <Activity className="h-8 w-8 text-primary/70 mb-1" />
            <h3 className="text-sm font-semibold text-foreground">No Telemetry Timeline Data Available</h3>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Run <code className="text-primary font-mono px-1">traffic_sim.py</code> to ingest live event streams and watch timeline trends update in real time.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashColorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2255" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF2255" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashColorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7700" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF7700" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashColorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#FF2255" fill="url(#dashColorCritical)" name="Critical" />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#FF7700" fill="url(#dashColorHigh)" name="High" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#FFB800" fill="url(#dashColorMedium)" name="Medium" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#00FF9D" fill="transparent" name="Low" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

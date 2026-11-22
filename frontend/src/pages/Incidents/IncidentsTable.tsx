import { format, parseISO } from "date-fns";
import type { IncidentResponse } from "@/api/incidents";
import { SearchX } from "lucide-react";

interface IncidentsTableProps {
  incidents: IncidentResponse[];
  onSelectIncident: (incident: IncidentResponse) => void;
}

/* =======================================================
   BRUTALIST BADGES
   ======================================================= */
function FlatBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535]/10 text-[#d83535] border-[#d83535]/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest border ${map[severity?.toLowerCase()] || "bg-zinc-900/50 text-zinc-400 border-zinc-800"}`}>
      {severity || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    acknowledged: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    investigating: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    escalated: "text-red-500 border-red-500/30 bg-red-500/5",
    resolved: "text-green-400 border-green-400/30 bg-green-400/5",
    closed: "text-zinc-500 border-zinc-800 bg-zinc-900/20",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] border ${map[status?.toLowerCase()] || map.closed}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export function IncidentsTable({ incidents, onSelectIncident }: IncidentsTableProps) {
  
  // Terminal Empty State
  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#030303] border border-dashed border-zinc-800 font-['DM_Mono',monospace]">
        <SearchX className="h-10 w-10 mb-4 opacity-50 text-zinc-500" />
        <span className="text-[11px] text-zinc-400 tracking-[0.3em] uppercase block mb-3 text-center">
          // 0 INCIDENT CLUSTERS FOUND //
        </span>
        <p className="text-[11px] text-zinc-600 max-w-md text-center leading-[1.8] font-light tracking-wide">
          No security incidents matched your active filters or query metrics. 
        </p>
        <div className="w-12 h-[1px] bg-zinc-800 mt-10" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#000] border-t border-b border-zinc-900 font-['DM_Mono',monospace] overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh] md:max-h-[650px] relative custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[950px]">
          
          <thead className="bg-[#030303] sticky top-0 z-20 shadow-[0_1px_0_0_#18181b]">
            <tr>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Incident ID
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Incident Title
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Severity Tag
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                State
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Assigned Analyst
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Vector Source
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Timestamp
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-[#f4f4f5] uppercase tracking-[0.2em] font-normal whitespace-nowrap text-right">
                Last Updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900/50">
            {incidents.map((incident) => (
              <tr 
                key={incident.id} 
                onClick={() => onSelectIncident(incident)}
                className="hover:bg-[#050505] transition-colors cursor-crosshair group relative"
              >
                
                {/* ID with Left Laser Indicator on Hover */}
                <td className="px-5 py-4 text-xs font-semibold text-[#06b6d4] whitespace-nowrap relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#06b6d4]/50 group-hover:w-[3px] transition-all duration-300" />
                  #{incident.id}
                </td>
                
                {/* Title */}
                <td className="px-5 py-4 text-[13px] text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors max-w-[220px] truncate" title={incident.title}>
                  {incident.title}
                </td>
                
                {/* Severity */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <SeverityBadge severity={incident.severity} />
                </td>
                
                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={incident.status} />
                </td>
                
                {/* Analyst */}
                <td className="px-5 py-4 text-xs text-zinc-400 whitespace-nowrap uppercase">
                  {incident.assigned_to_username || "UNASSIGNED"}
                </td>
                
                {/* Source */}
                <td className="px-5 py-4 text-xs text-orange-500 font-mono whitespace-nowrap">
                  {incident.source_ip || incident.source || "SYSTEM_DAEMON"}
                </td>
                
                {/* Created Date */}
                <td className="px-5 py-4 text-[11px] text-zinc-600 tracking-widest whitespace-nowrap">
                  {incident.created_at ? format(parseISO(incident.created_at), "yyyy.MM.dd // HH:mm") : "N/A"}
                </td>
                
                {/* Updated Date */}
                <td className="px-5 py-4 text-[11px] text-zinc-400 tracking-widest whitespace-nowrap text-right group-hover:text-[#f4f4f5] transition-colors">
                  {incident.updated_at ? format(parseISO(incident.updated_at), "yyyy.MM.dd // HH:mm") : "N/A"}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlertsTableProps {
  alerts: any[];
}

type SortField = "created_at" | "severity" | "status" | "updated_at";
type SortOrder = "asc" | "desc";

/* =======================================================
   BRUTALIST BADGES (Direct match from AlertDetails)
   ======================================================= */
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535]/10 text-[#d83535] border-[#d83535]/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] border ${map[severity?.toLowerCase()] || "bg-zinc-900/50 text-zinc-400 border-zinc-800"}`}>
      {severity || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    acknowledged: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    investigating: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    resolved: "text-green-400 border-green-400/30 bg-green-400/5",
    closed: "text-zinc-500 border-zinc-800 bg-zinc-900/20",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] border ${map[status?.toLowerCase()] || map.closed}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export function AlertsTable({ alerts }: AlertsTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const severityWeight: Record<string, number> = {
    critical: 4, high: 3, medium: 2, low: 1
  };

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "severity") {
        valA = severityWeight[a.severity?.toLowerCase()] || 0;
        valB = severityWeight[b.severity?.toLowerCase()] || 0;
      } else if (sortField === "created_at" || sortField === "updated_at") {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [alerts, sortField, sortOrder]);

  // Terminal Empty State
  if (alerts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-16 bg-[#030303] border border-dashed border-zinc-800 font-['DM_Mono',monospace]">
        <div className="w-12 h-[1px] bg-zinc-800 mb-6" />
        <span className="text-[11px] text-zinc-600 tracking-[0.3em] uppercase">
          // 0 RECORDS MATCH SPECIFIED MATRIX //
        </span>
        <div className="w-12 h-[1px] bg-zinc-800 mt-6" />
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown 
      className={`ml-1.5 h-[10px] w-[10px] inline-block transition-colors ${
        sortField === field ? "text-[#06b6d4]" : "text-zinc-700 group-hover:text-zinc-300"
      }`} 
    />
  );

  return (
    <div className="w-full bg-[#000] border-t border-b border-zinc-900 font-['DM_Mono',monospace] overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          
          <thead className="bg-[#030303]">
            <tr>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                ID Hash
              </th>
              <th 
                className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap cursor-pointer group hover:bg-[#080808] transition-colors"
                onClick={() => handleSort("severity")}
              >
                Severity <SortIcon field="severity" />
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Telemetry Log
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Source IP
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Target IP
              </th>
              <th 
                className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap cursor-pointer group hover:bg-[#080808] transition-colors"
                onClick={() => handleSort("status")}
              >
                Condition <SortIcon field="status" />
              </th>
              <th 
                className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap cursor-pointer group hover:bg-[#080808] transition-colors"
                onClick={() => handleSort("created_at")}
              >
                Ingest Timestamp <SortIcon field="created_at" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900/50">
            {sortedAlerts.map((alert) => (
              <tr 
                key={alert.id} 
                className="hover:bg-[#050505] transition-colors cursor-pointer group"
                onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
              >
                {/* ID - Cyan highlight on row hover */}
                <td className="px-5 py-4 text-xs text-zinc-500 group-hover:text-[#06b6d4] transition-colors whitespace-nowrap">
                  #{alert.id}
                </td>
                
                {/* Severity */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <SeverityBadge severity={alert.severity} />
                </td>
                
                {/* Title - Bright white on hover */}
                <td className="px-5 py-4 text-[13px] text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors max-w-[300px] truncate" title={alert.title}>
                  {alert.title}
                </td>
                
                {/* IPs - Terminal grey */}
                <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">
                  {alert.source_ip || "NULL_ADDR"}
                </td>
                <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">
                  {alert.destination_ip || "NULL_ADDR"}
                </td>
                
                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={alert.status} />
                </td>
                
                {/* Date - Styled exact like other views (YYYY.MM.DD) */}
                <td className="px-5 py-4 text-[11px] text-zinc-600 tracking-widest whitespace-nowrap group-hover:text-zinc-400 transition-colors">
                  {format(new Date(alert.created_at), "yyyy.MM.dd // HH:mm:ss")}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
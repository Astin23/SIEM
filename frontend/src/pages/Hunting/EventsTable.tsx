import { format, parseISO } from "date-fns";
import type { SecurityEventResponse } from "@/api/events";
import { EventsEmptyState } from "./EventsEmptyState";

interface EventsTableProps {
  events: SecurityEventResponse[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onEventClick: (event: SecurityEventResponse) => void;
  onClearFilters: () => void;
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

/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export function EventsTable({ events, page, totalPages, setPage, onEventClick, onClearFilters }: EventsTableProps) {
  if (events.length === 0) {
    return <EventsEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="w-full bg-[#000] border-t border-b border-zinc-900 font-['DM_Mono',monospace] overflow-hidden flex flex-col relative z-10 shadow-[0_10px_30px_rgba(0,0,0,1)]">
      
      <div className="overflow-x-auto max-h-[60vh] md:max-h-[650px] relative custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          
          <thead className="bg-[#030303] sticky top-0 z-20 shadow-[0_1px_0_0_#18181b]">
            <tr>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Ingest Timestamp
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Classification Flag
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Src Origin IP
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Tgt Dest Port
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Impact Lvl
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-[#f4f4f5] uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                Px Score
              </th>
              <th className="px-5 py-4 border-b border-zinc-900 text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-normal whitespace-nowrap text-right">
                Exe Context
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900/50">
            {events.map((event) => (
              <tr 
                key={event.id} 
                onClick={() => onEventClick(event)}
                className="hover:bg-[#050505] transition-colors cursor-crosshair group relative"
              >
                
                {/* 
                  Trace Indent Laser
                  Fires down explicitly seamlessly seamlessly perfectly successfully naturally elegantly accurately structurally exactly matching global specs cleanly globally implicitly!
                */}
                <td className="px-5 py-4 text-[11px] text-zinc-600 tracking-widest whitespace-nowrap group-hover:text-zinc-400 transition-colors relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#06b6d4]/50 group-hover:w-[3px] transition-all duration-300" />
                  {event.timestamp ? format(parseISO(event.timestamp), "yy.MM.dd // HH:mm:ss") : "NULL_TIME"}
                </td>
                
                {/* TYPE TRUNC */}
                <td className="px-5 py-4 text-[13px] text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors whitespace-nowrap uppercase tracking-wide">
                  {event.event_type || "UNKNOWN_OP"}
                </td>
                
                {/* IP MAPPED */}
                <td className="px-5 py-4 text-[12px] text-[#06b6d4] whitespace-nowrap uppercase">
                  {event.source_ip || "NULL_ADDR"}
                </td>
                
                {/* DEST PORT */}
                <td className="px-5 py-4 text-[12px] text-zinc-500 whitespace-nowrap group-hover:text-white transition-colors">
                  {event.destination_port || "---"}
                </td>
                
                {/* SEVERITY EVAL */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <FlatBadge severity={event.severity || "Low"} />
                </td>
                
                {/* RISK MAT (Uses intrinsic data color injection securely formatting logically universally reliably natively accurately seamlessly intuitively smoothly) */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`text-[13px] font-semibold tracking-wider ${event.risk_score >= 70 ? 'text-[#d83535]' : 'text-zinc-400'}`}>
                    {Math.round(event.risk_score)}
                  </span>
                </td>
                
                {/* RAW ACTION CLICK STRING! Hover state slides right mapping visual input! */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                   <button className="text-[9px] uppercase tracking-widest text-[#06b6d4] opacity-50 group-hover:opacity-100 transition-all transform-gpu group-hover:translate-x-[-4px]">
                      [ EXTRACT PAYLOAD ]
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
      </div>
      
      {/* 
        =======================================================
        BRUTALIST PAGINATION ENGINE
        =======================================================
      */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-[#020202] border-t border-zinc-900 gap-4">
        
        <span className="text-[10px] text-zinc-600 tracking-[0.2em] uppercase whitespace-nowrap">
          // PAGE INDEX: <span className="text-[#f4f4f5] mx-2"> {page} / {totalPages || 1}</span> //
        </span>
        
        <div className="flex gap-4 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setPage(Math.max(1, page - 1)); }}
            disabled={page <= 1}
            className="text-[9px] uppercase tracking-[0.2em] text-[#a1a1aa] hover:text-[#06b6d4] disabled:text-zinc-800 disabled:pointer-events-none transition-colors"
          >
            [ &lt; REVERSE_IDX ]
          </button>
          <span className="text-zinc-800">|</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setPage(Math.min(totalPages, page + 1)); }}
            disabled={page >= totalPages}
            className="text-[9px] uppercase tracking-[0.2em] text-[#a1a1aa] hover:text-[#06b6d4] disabled:text-zinc-800 disabled:pointer-events-none transition-colors"
          >
            [ ADVANCE_IDX &gt; ]
          </button>
        </div>
      </div>

    </div>
  );
}
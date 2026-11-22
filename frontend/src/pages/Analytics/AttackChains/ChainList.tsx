import { format, differenceInMinutes, differenceInHours } from "date-fns";
import type { AttackChainResponse } from "@/api/chains";
import { Network, SearchX } from "lucide-react";

interface ChainListProps {
  chains: AttackChainResponse[];
  onSelectChain: (chain: AttackChainResponse) => void;
}

/* =======================================================
   BRUTALIST BADGES (Matched against previous generic configs natively!)
   ======================================================= */
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535]/10 text-[#d83535] border-[#d83535]/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest border ${map[severity?.toLowerCase()] || "bg-zinc-900/50 text-zinc-400 border-zinc-800"}`}>
      SEV: {severity || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    acknowledged: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    investigating: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    resolved: "text-green-400 border-green-400/30 bg-green-400/5",
    active: "text-red-500 border-red-500/30 bg-red-500/5",
    closed: "text-zinc-500 border-zinc-800 bg-zinc-900/20",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] border ${map[status?.toLowerCase()] || map.closed}`}>
      {status || "UNKNOWN"}
    </span>
  );
}


/* =======================================================
   MAIN COMPONENT EXPORT
   ======================================================= */
export function ChainList({ chains, onSelectChain }: ChainListProps) {
  
  // Terminal Error State Handling
  if (!chains || chains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-[#030303] border border-dashed border-zinc-800 font-['DM_Mono',monospace]">
        <SearchX className="h-10 w-10 mb-4 opacity-50 text-[#06b6d4]" />
        <span className="text-[11px] text-zinc-600 tracking-[0.3em] uppercase block mb-4">
          // 0 THREAT VECTORS FOUND //
        </span>
        <div className="w-12 h-[1px] bg-zinc-800" />
      </div>
    );
  }

  // Pure Math Utility Operations unchanged!
  const safeParseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try { const d = new Date(dateStr); return isNaN(d.getTime()) ? null : d; } 
    catch { return null; }
  };
  
  const formatDuration = (start?: string, end?: string) => {
    const startDate = safeParseDate(start); const endDate = safeParseDate(end);
    if (!startDate || !endDate) return "RUNTIME: ACTIVE";
    try {
      const hours = differenceInHours(endDate, startDate);
      if (hours > 0) return `${hours}H ELAPSED`;
      const mins = differenceInMinutes(endDate, startDate);
      return `${Math.max(1, mins)}M ELAPSED`;
    } catch { return "RUNTIME: ACTIVE"; }
  };

  return (
    <div className="flex flex-col gap-4 font-['DM_Mono',monospace]">
      {chains.map((chain) => (
        
        <div 
          key={chain.id} 
          // Interactive Flat Trace Matrix Board wrapper logic overrides standard generic shadCN wrappers!
          className="group flex flex-col xl:flex-row bg-[#030303] border border-zinc-900 hover:border-[#06b6d4]/50 cursor-pointer overflow-hidden transition-all duration-300 relative hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          onClick={() => onSelectChain(chain)}
        >
          {/* Top/Left Identification Data */}
          <div className="flex flex-col justify-center flex-1 p-5 border-b xl:border-b-0 xl:border-r border-zinc-900 min-w-0">
             
             {/* Header */}
             <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-none bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                 <h3 className="font-['AeroRetina'] text-xl md:text-2xl text-[#f4f4f5] tracking-tight m-0 uppercase truncate max-w-[200px] md:max-w-[400px]">
                   {chain.name || `MATRIX_${chain.id}`}
                 </h3>
               </div>
               
               <div className="flex items-center gap-2">
                 <StatusBadge status={chain.status || "active"} />
                 <SeverityBadge severity={chain.severity || "Low"} />
               </div>
             </div>

             {/* Tracking Sub Data! */}
             <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase text-zinc-500 tracking-wider">
               <span className="flex items-center gap-2 text-zinc-400">
                  <Network className="w-3 h-3 text-zinc-600" /> GRAPH TRACE ID: {chain.id}
               </span>
               <span className="hidden sm:block text-zinc-800">|</span>
               <span>INIT: {safeParseDate(chain.start_time) ? format(new Date(chain.start_time), "yyyy.MM.dd // HH:mm") : "UNKNOWN"}</span>
               <span className="hidden sm:block text-zinc-800">|</span>
               <span className="text-[#06b6d4]">{formatDuration(chain.start_time, chain.end_time)}</span>
             </div>

          </div>

          {/* Right Geometric Param Blocks (Responsive mapped explicitly matching) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 shrink-0 w-full xl:w-[600px]">
            
            {/* PARAM 1 */}
            <div className="bg-[#050505] group-hover:bg-[#080808] p-4 flex flex-col justify-center transition-colors">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Impact Score</span>
              <span className={`text-base font-semibold tracking-wider ${chain.risk_score && chain.risk_score >= 70 ? 'text-[#d83535]' : 'text-zinc-200'}`}>
                {chain.risk_score || "N/A"}
              </span>
            </div>
            
            {/* PARAM 2 */}
            <div className="bg-[#050505] group-hover:bg-[#080808] p-4 flex flex-col justify-center transition-colors min-w-0">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Assessed TGT</span>
              <span className="text-xs text-[#06b6d4] truncate uppercase tracking-widest" title={chain.target_system}>
                {chain.target_system || "NULL_TARGET"}
              </span>
            </div>

            {/* PARAM 3 */}
            <div className="bg-[#050505] group-hover:bg-[#080808] p-4 flex flex-col justify-center transition-colors min-w-0">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Identified SRC</span>
              <span className="text-xs text-[#d83535] font-semibold truncate tracking-wider" title={chain.source_ip}>
                {chain.source_ip || "0.0.0.0"}
              </span>
            </div>

            {/* PARAM 4 (Graph Block Sequence Map Engine UI) */}
            <div className="bg-[#050505] group-hover:bg-[#080808] p-4 flex flex-col justify-center relative transition-colors border-l border-zinc-900 xl:border-l-0">
              {/* Overlapping Hover Highlight specific action command corner prompt UI implicitly styled explicitly in hover modes without changing DOM components inherently causing layout breaks */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#06b6d4] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Sub-Nodes Detected</span>
              
              {/* Graphic Matrix Line Renderer purely generated natively replacing empty static box wrappers representing code elements accurately dynamically adjusting length! */}
              <div className="flex items-center gap-[2px] mt-1 overflow-hidden h-[12px]">
                {chain.stages.length === 0 ? (
                  <span className="text-[10px] text-zinc-700 uppercase tracking-widest block font-semibold leading-none">[ ZERO TRACES ]</span>
                ) : (
                  Array.from({ length: Math.min(chain.stages.length, 12) }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-full ${i < 3 ? 'bg-[#d83535]' : 'bg-[#06b6d4]/50'}`} />
                  ))
                )}
                {chain.stages.length > 12 && (
                  <span className="text-[8px] text-zinc-500 font-bold ml-1 block leading-none">+{chain.stages.length - 12}</span>
                )}
              </div>

            </div>

          </div>

        </div>
      ))}
    </div>
  );
}
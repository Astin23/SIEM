interface AnalyticsSummaryCardsProps {
  eventStats: any;
  alertStats: any;
  riskScore: any;
}

export function AnalyticsSummaryCards({ eventStats, alertStats, riskScore }: AnalyticsSummaryCardsProps) {
  const activeAlerts = (alertStats?.new || 0) + (alertStats?.investigating || 0) + (alertStats?.escalated || 0);
  const avgRiskScore = Math.round(riskScore?.avg_score || 0);

  // Native dynamic coloring for Risk Level tracking specifically natively directly
  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-[#d83535]";
    if (score >= 40) return "text-orange-500";
    return "text-[#10b981]";
  };

  return (
    <div className="w-full flex flex-col font-['DM_Mono',monospace]">
       
      {/* 
         TOP ROW: Core Aggregation Metrics (Using wider card sizing matching implicit importance structurally!)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[2px] bg-zinc-900 mb-[2px]">
        
        {/* Metric 1 */}
        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-6 flex flex-col justify-center min-h-[140px] relative">
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#06b6d4]" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Volume // Aggregate</span>
          <span className="text-4xl text-[#06b6d4] tracking-tight">{eventStats?.malicious_count?.toLocaleString() || "0"}</span>
          <span className="text-[10px] text-zinc-500 mt-2">// MALICIOUS EVENTS INGESTED</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-6 flex flex-col justify-center min-h-[140px] relative">
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-orange-500" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Backlog // Active</span>
          <span className="text-4xl text-orange-500 tracking-tight">{activeAlerts.toLocaleString() || "0"}</span>
          <span className="text-[10px] text-zinc-500 mt-2">// ALERTS AWAITING TRIAGE</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-6 flex flex-col justify-center min-h-[140px] relative">
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#10b981]" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Resolution // Cleared</span>
          <span className="text-4xl text-[#10b981] tracking-tight">{alertStats?.resolved?.toLocaleString() || "0"}</span>
          <span className="text-[10px] text-zinc-500 mt-2">// SECURITY ALERTS MITIGATED</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-6 flex flex-col justify-center min-h-[140px] relative">
          <div className="absolute top-0 left-0 w-1.5 h-[50px] bg-zinc-800" />
          <div className="absolute top-0 left-0 w-1.5 h-[20px] bg-[#f4f4f5]" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Risk // Global Matrix</span>
          <span className={`text-4xl font-semibold tracking-tighter ${getRiskColor(avgRiskScore)}`}>{avgRiskScore.toString()}</span>
          <span className="text-[10px] text-zinc-500 mt-2">// SYSTEM EXPOSURE INDEX</span>
        </div>
      </div>


      {/* 
         BOTTOM ROW: Severity Stratification Array (Smaller Sub-grid natively attached below!)
      */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[2px] bg-zinc-900">
        
        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-4 md:p-6 flex flex-col justify-between items-start md:flex-row md:items-center min-h-[80px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-0">Priority_01</span>
          <span className="text-xl md:text-2xl text-[#d83535]">{eventStats?.critical?.toLocaleString() || "0"}</span>
        </div>

        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-4 md:p-6 flex flex-col justify-between items-start md:flex-row md:items-center min-h-[80px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-0">Priority_02</span>
          <span className="text-xl md:text-2xl text-orange-500">{eventStats?.high?.toLocaleString() || "0"}</span>
        </div>

        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-4 md:p-6 flex flex-col justify-between items-start md:flex-row md:items-center min-h-[80px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-0">Priority_03</span>
          <span className="text-xl md:text-2xl text-yellow-500">{eventStats?.medium?.toLocaleString() || "0"}</span>
        </div>

        <div className="bg-[#030303] hover:bg-[#050505] transition-colors p-4 md:p-6 flex flex-col justify-between items-start md:flex-row md:items-center min-h-[80px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-2 md:mb-0">Priority_04</span>
          <span className="text-xl md:text-2xl text-[#06b6d4]">{eventStats?.low?.toLocaleString() || "0"}</span>
        </div>

      </div>

    </div>
  );
}
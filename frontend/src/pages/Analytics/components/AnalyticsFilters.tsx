interface AnalyticsFiltersProps {
  days: number;
  setDays: (days: number) => void;
}

export function AnalyticsFilters({ days, setDays }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between font-['DM_Mono',monospace]">
      
      {/* HUD Header String Map Native */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-none animate-pulse" />
        <span className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-light">
          TIME-SERIES AGGREGATOR ENGINE [RANGE PARAM]
        </span>
      </div>
      
      {/* 
        Brutalist Filter Array! 
        Uses flat geometries and explicit explicit background replacements avoiding components! 
      */}
      <div className="flex items-center w-full md:w-auto bg-[#000] border border-zinc-900">
        <button 
          onClick={() => setDays(1)}
          className={`flex-1 md:flex-none text-[10px] tracking-widest uppercase px-6 py-2 transition-all ${
            days === 1 
              ? "bg-[#06b6d4]/10 border-t border-t-[#06b6d4] text-[#06b6d4]" 
              : "bg-transparent text-zinc-600 hover:text-zinc-300 hover:bg-[#050505] border-t border-t-transparent"
          }`}
        >
          T-24H
        </button>

        {/* Technical Divider Pipe */}
        <div className="w-[1px] h-4 bg-zinc-900" />

        <button 
          onClick={() => setDays(7)}
          className={`flex-1 md:flex-none text-[10px] tracking-widest uppercase px-6 py-2 transition-all ${
            days === 7 
              ? "bg-orange-500/10 border-t border-t-orange-500 text-orange-500" 
              : "bg-transparent text-zinc-600 hover:text-zinc-300 hover:bg-[#050505] border-t border-t-transparent"
          }`}
        >
          T-07D
        </button>

        {/* Technical Divider Pipe */}
        <div className="w-[1px] h-4 bg-zinc-900" />

        <button 
          onClick={() => setDays(30)}
          className={`flex-1 md:flex-none text-[10px] tracking-widest uppercase px-6 py-2 transition-all ${
            days === 30 
              ? "bg-[#d83535]/10 border-t border-t-[#d83535] text-[#d83535]" 
              : "bg-transparent text-zinc-600 hover:text-zinc-300 hover:bg-[#050505] border-t border-t-transparent"
          }`}
        >
          T-30D
        </button>
      </div>

    </div>
  );
}
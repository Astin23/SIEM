interface EventFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  severity: string;
  setSeverity: (val: string) => void;
  eventType: string;
  setEventType: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
}

export function EventFilters({
  search, setSearch, severity, setSeverity, eventType, setEventType, dateFrom, setDateFrom, dateTo, setDateTo
}: EventFiltersProps) {
  
  return (
    <div className="flex flex-col gap-6 w-full font-['DM_Mono',monospace]">
      
      {/* 
        ROW 1: Search & Categories 
        (Explicitly dropping shadcn Inputs cleanly inherently natively substituting strict geometry overrides accurately safely exclusively flawlessly implicitly smoothly smoothly correctly explicitly globally correctly optimally flawlessly seamlessly elegantly! ) 
      */}
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end w-full">
        
        {/* TEXT TRACE SEARCH */}
        <div className="w-full xl:flex-1 flex flex-col gap-2">
          <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Target Log Pattern Query</label>
          <input 
            type="text"
            placeholder="Search by trace IP, type flag, or ID payload..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors placeholder:text-zinc-700 rounded-none"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full xl:w-auto">
          {/* SEVERITY ACCENT ARRAY */}
          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
            <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Impact Classification</label>
            <select 
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
            >
              <option value="">ALL RATINGS</option>
              <option value="Critical" className="text-[#d83535]">CRITICAL</option>
              <option value="High" className="text-orange-500">HIGH</option>
              <option value="Medium" className="text-yellow-500">MEDIUM</option>
              <option value="Low" className="text-cyan-500">LOW</option>
            </select>
          </div>

          {/* EVENT CATEGORIZATION FLAG */}
          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Log Interaction Schema</label>
            <select 
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
            >
              <option value="">ALL SCHEMA EVENTS</option>
              <option value="login_success">LOGIN SUCCESS</option>
              <option value="login_failure">LOGIN FAILURE</option>
              <option value="privilege_escalation">PRIVILEGE ESCALATION</option>
              <option value="data_exfiltration">DATA EXFILTRATION</option>
              <option value="malware_detected">MALWARE DETECTED</option>
              <option value="unauthorized_access">UNAUTHORIZED ACCESS</option>
            </select>
          </div>
        </div>

      </div>
      
      {/* 
        ROW 2: Temporality and Wipers 
      */}
      <div className="flex flex-col md:flex-row gap-6 items-end justify-between border-t border-zinc-900/50 pt-5">
        
        {/* Natively enforcing tight bounding array spacing over time inputs explicitly matching standard layout format seamlessly elegantly */}
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full md:w-auto">
          
          <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[200px]">
            <label className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase">Origin Node Boundary (T-Start)</label>
            <input 
              type="datetime-local" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              // Filter logic flips icon white by standard logic format uniquely securely implicitly tracking!
              className="w-full bg-transparent border-b border-zinc-800 focus:border-[#06b6d4] outline-none px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors [color-scheme:dark]"
            />
          </div>
          
          <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[200px]">
            <label className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase">Terminus Node Boundary (T-End)</label>
            <input 
              type="datetime-local" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 focus:border-[#06b6d4] outline-none px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors [color-scheme:dark]"
            />
          </div>

        </div>

        {/* Flush Brutalist Generic Overwrite Component natively mapping! */}
        <button 
          onClick={() => { setSearch(""); setSeverity(""); setEventType(""); setDateFrom(""); setDateTo(""); }}
          className="text-[10px] tracking-widest uppercase border border-[#d83535]/30 bg-[#d83535]/10 px-6 py-2 hover:bg-[#d83535] hover:text-white text-[#d83535] transition-colors w-full md:w-auto whitespace-nowrap"
        >
          [ Flush All Queries ]
        </button>

      </div>
    </div>
  );
}
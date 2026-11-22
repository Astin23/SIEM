interface ChainFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity: string;
  onSeverityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export function ChainFilters({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
}: ChainFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full font-['DM_Mono',monospace]">
      
      {/* SEARCH COMPONENT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-2">
        <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Target Vector Query</label>
        <input 
          type="text"
          placeholder="Search name, origin IP, user hash..." 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors placeholder:text-zinc-700 rounded-none"
        />
      </div>

      {/* MULTI-FILTERS BLOCK */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full xl:w-auto">
        
        {/* SEVERITY DROPDOWN */}
        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
          <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Impact Tag</label>
          <select 
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
          >
            <option value="">ALL IMPACTS</option>
            <option value="Critical" className="text-[#d83535]">CRITICAL</option>
            <option value="High" className="text-orange-500">HIGH</option>
            <option value="Medium" className="text-yellow-500">MEDIUM</option>
            <option value="Low" className="text-cyan-500">LOW</option>
          </select>
        </div>

        {/* STATUS DROPDOWN */}
        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
          <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Active Status</label>
          <select 
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
          >
            <option value="">ALL CONDITIONS</option>
            <option value="active" className="text-yellow-500">ACTIVE</option>
            <option value="contained" className="text-[#06b6d4]">CONTAINED</option>
            <option value="resolved" className="text-[#10b981]">RESOLVED</option>
          </select>
        </div>

      </div>

    </div>
  );
}
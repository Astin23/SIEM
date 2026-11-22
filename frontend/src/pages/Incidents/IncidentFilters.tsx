interface IncidentFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  severity: string;
  onSeverityChange: (val: string) => void;
}

export function IncidentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  severity,
  onSeverityChange,
}: IncidentFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full font-['DM_Mono',monospace]">
      
      {/* SEARCH INPUT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-2">
        <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Incident Query Filter</label>
        <input 
          type="text"
          placeholder="Search by title, IP, or ID..." 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors placeholder:text-zinc-700 rounded-none"
        />
      </div>

      {/* FILTER DROPDOWNS */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full xl:w-auto">
        
        {/* SEVERITY DROPDOWN */}
        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Severity Vector</label>
          <select 
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
          >
            <option value="All">ALL SEVERITIES</option>
            <option value="Critical" className="text-[#d83535]">CRITICAL</option>
            <option value="High" className="text-orange-500">HIGH</option>
            <option value="Medium" className="text-yellow-500">MEDIUM</option>
            <option value="Low" className="text-cyan-500">LOW</option>
          </select>
        </div>

        {/* STATUS DROPDOWN */}
        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Incident State</label>
          <select 
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
          >
            <option value="All">ALL STATES</option>
            <option value="new" className="text-blue-400">NEW</option>
            <option value="acknowledged" className="text-purple-400">ACKNOWLEDGED</option>
            <option value="investigating" className="text-yellow-400">INVESTIGATING</option>
            <option value="escalated" className="text-red-500">ESCALATED</option>
            <option value="resolved" className="text-green-400">RESOLVED</option>
            <option value="closed" className="text-zinc-500">CLOSED</option>
          </select>
        </div>

      </div>

    </div>
  );
}
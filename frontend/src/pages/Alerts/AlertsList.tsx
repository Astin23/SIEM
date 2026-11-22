import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertsQuery } from "@/hooks/useAlerts";
import { AlertsTable } from "./AlertsTable";
import { Pagination } from "@/components/ui-custom/Pagination";
import { useAuthStore } from "@/store/useAuthStore";

export function AlertsList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Nav structure identical to Dashboard
  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: true }, // Marked active
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    if(logout) logout();
    navigate("/login");
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, isFetching } = useAlertsQuery({
    page,
    pageSize,
    search: debouncedSearch,
    severity,
    status,
  });

  const handleFilterChange = (setter: any, value: string) => {
    setter(value);
    setPage(1); 
  };

  // Loader matching Dashboard UI
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
         <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">
           // AGGREGATING THREAT TELEMETRY...
         </span>
      </div>
    );
  }

  // Error State matching Dashboard UI
  if (isError) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-red-500 font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
         <h2 className="text-xl tracking-widest uppercase">FATAL_ERROR: INDEX_UNREACHABLE</h2>
         <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
            The secure data cluster failed to respond. Verify backend availability and network connectivity.
         </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
      
      {/* 
        =======================================================
        SIDEBAR NAVIGATION (Exact match to Dashboard)
        =======================================================
      */}
      <aside className="w-[280px] h-full flex flex-col pt-10 pb-8 px-6 bg-[#030303] border-r border-zinc-900 shrink-0">
         {/* Logo */}
         <div className="mb-14 px-2">
            <h1 className="font-['AeroSemibold'] text-3xl text-[#f4f4f5] tracking-tight m-0 select-none">
              SENT<span className="lowercase inline-block">ri</span>X
            </h1>
         </div>

         {/* Nav Links */}
         <nav className="flex flex-col gap-1 w-full">
            {navItems.map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path}
                className={`text-[13px] tracking-wide px-4 py-3 transition-colors ${
                  item.active 
                    ? "bg-[#f4f4f5] text-black font-semibold rounded-[4px] shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                 {item.name}
              </Link>
            ))}
         </nav>

         {/* Bottom User Area */}
         <div className="mt-auto flex flex-col pt-8">
            <span className="text-[12px] text-zinc-500 mb-6 leading-[1.6] px-4 break-all underline underline-offset-4 decoration-zinc-800">
              mayanknegi15011@gma<br/>il.com
            </span>
            <button 
              onClick={handleLogout}
              className="w-full bg-[#fdf2f2] text-[#cc3333] hover:bg-white font-semibold text-[13px] tracking-wide py-3 rounded-[4px] transition-colors"
            >
              Sign Out
            </button>
         </div>
      </aside>

      {/* 
        =======================================================
        MAIN ALERTS CONTENT 
        =======================================================
      */}
      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">
         
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 pt-10 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest mb-3">
               // Threat Analysis Module
            </span>
            <h1 className="font-['AeroRetina'] text-4xl lg:text-[4rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Alert Management
            </h1>
          </div>
          <p className="text-zinc-500 text-xs mt-4 md:mt-0 text-left md:text-right max-w-sm tracking-wide leading-relaxed">
            Triage, investigate, and actively respond to prioritized system security alerts across your cluster.
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="w-full px-6 md:px-8 py-6 shrink-0">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between border border-zinc-900 bg-[#030303] p-5 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none" />

            <div className="w-full xl:w-1/3 flex flex-col gap-2">
              <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Locator Query</label>
              <input 
                type="text"
                placeholder="Search title, source IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors placeholder:text-zinc-700"
              />
            </div>
            
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full xl:w-auto">
              <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Severity</label>
                <select 
                  value={severity}
                  onChange={(e) => handleFilterChange(setSeverity, e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">ALL SEVERITIES</option>
                  <option value="Critical" className="text-[#d83535]">CRITICAL</option>
                  <option value="High" className="text-orange-500">HIGH</option>
                  <option value="Medium" className="text-yellow-500">MEDIUM</option>
                  <option value="Low" className="text-cyan-500">LOW</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Event Status</label>
                <select 
                  value={status}
                  onChange={(e) => handleFilterChange(setStatus, e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">ALL STATUSES</option>
                  <option value="New">NEW</option>
                  <option value="Acknowledged">ACKNOWLEDGED</option>
                  <option value="Investigating">INVESTIGATING</option>
                  <option value="Resolved">RESOLVED</option>
                  <option value="Closed">CLOSED</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                <label className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase">Date Timeframe</label>
                <select disabled className="w-full bg-[#000000] border border-zinc-900 outline-none px-4 py-2.5 text-xs text-zinc-700 uppercase cursor-not-allowed appearance-none">
                  <option>ALL TIME</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className={`flex-1 flex flex-col px-6 md:px-8 transition-opacity duration-300 relative ${isFetching && !isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          {isFetching && !isLoading && (
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-zinc-900 overflow-hidden z-50">
                 <div className="h-full bg-cyan-500/50 w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
              </div>
          )}

          <div className="w-full border-t border-zinc-900 pt-6">
            <AlertsTable alerts={data?.alerts || []} />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-900 mt-6 pt-6 pb-12 gap-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-4">
              <span>[ RECS: <span className="text-[#f4f4f5]"> {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data?.total || 0)}</span> ]</span>
              <span>// TOTAL LOGS: <span className="text-[#f4f4f5]">{data?.total || 0}</span></span>
            </div>
            
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <Pagination currentPage={page} totalPages={data?.total_pages || 1} onPageChange={setPage} />
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardKPIs } from "@/hooks/useDashboardData";
import { RecentAlertsList } from "@/components/ui-custom/RecentAlertsList";
import { LiveEventFeed } from "@/components/ui-custom/LiveEventFeed";
import { SeverityChart } from "@/components/ui-custom/SeverityChart";
import { EventTimelinePlaceholder } from "@/components/ui-custom/EventTimelinePlaceholder";
import { useAuthStore } from "@/store/useAuthStore";

export function Dashboard() {
  const { data, isLoading, isError } = useDashboardKPIs();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout); // Optional: Trigger logout 
  
  // Handlers
  const handleLogout = () => {
    if(logout) logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: true },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
         <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">// ESTABLISHING SECURE CONNECTION...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-red-500 font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
         <h2 className="text-xl">FATAL_ERROR: CONNECTION REFUSED</h2>
         <span className="text-zinc-500 text-xs text-center max-w-sm">Failed to sync SOC telemetry pipeline. Verify instance backend network path.</span>
      </div>
    );
  }

  const { alertStats, eventStats } = data;
  const totalEvents = eventStats?.total_events ?? eventStats?.total ?? 0;
  const activeAlerts = alertStats?.total_alerts ?? alertStats?.total_active ?? alertStats?.total ?? 0;
  const criticalAlerts = alertStats?.critical ?? alertStats?.severity_distribution?.critical ?? 0;
  const severityData = alertStats?.severity_distribution || {
    critical: alertStats?.critical || 0, high: alertStats?.high || 0,
    medium: alertStats?.medium || 0, low: alertStats?.low || 0,
  };
  const isFreshTenant = totalEvents === 0;

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
      
      {/* 
        =======================================================
        SIDEBAR NAVIGATION
        =======================================================
      */}
      <aside className="w-[280px] h-full flex flex-col pt-10 pb-8 px-6 bg-[#030303] border-r border-zinc-900 shrink-0">
         {/* Logo */}
         <div className="mb-14 px-2">
            <h1 className="font-['AeroSemibold'] text-3xl text-[#f4f4f5] tracking-tight m-0 select-none">
         SENT<span className="lowercase inline-block">ri</span>X
        </h1>
          <p className="text-[10px] text-zinc-500 tracking-[0.25em] uppercase mt-2">
  Security Operations Center
            </p>
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
        MAIN DASHBOARD CONTENT
        =======================================================
      */}
      <main className="flex-1 h-full p-6 md:p-8 flex flex-col gap-6 overflow-hidden bg-black">
         
         {/* 1. TOP METRIC CARDS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            {/* Card 1 */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-6 flex flex-col items-center justify-center shadow-lg shadow-black">
               <span className="text-zinc-100 text-[15px] font-semibold tracking-widest mb-4 uppercase">Total Events</span>
               {/* Applied the Deep Red numerical design exactly as seen in Screenshot */}
               <span className="text-[#d83535] text-4xl lg:text-[2.75rem] font-medium leading-none">{totalEvents}</span>
            </div>
            
            {/* Card 2 */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-6 flex flex-col items-center justify-center shadow-lg shadow-black">
               <span className="text-zinc-100 text-[15px] font-semibold tracking-widest mb-4 uppercase">Active Alerts</span>
               <span className="text-[#d83535] text-4xl lg:text-[2.75rem] font-medium leading-none">{activeAlerts}</span>
            </div>
            
            {/* Card 3 */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-6 flex flex-col items-center justify-center shadow-lg shadow-black">
               <span className="text-zinc-100 text-[15px] font-semibold tracking-widest mb-4 uppercase">Critical Alerts</span>
               <span className="text-[#d83535] text-4xl lg:text-[2.75rem] font-medium leading-none">{criticalAlerts}</span>
            </div>
         </div>


         {/* 2. MIDDLE TIMELINE/CHART SECTION */}
         <div className="flex-1 min-h-0 bg-[#09090b] border border-zinc-900 rounded-sm overflow-hidden flex flex-col relative shadow-lg shadow-black">
            {/* Native fallback wrapping if component has issues conforming to flex bounds */}
            {isFreshTenant ? (
              <div className="w-full h-full flex items-center justify-center flex-col">
                 <span className="text-zinc-600 text-sm tracking-widest uppercase">// AWAITING LOG TELEMETRY //</span>
              </div>
            ) : (
              <EventTimelinePlaceholder />
            )}
         </div>


         {/* 3. BOTTOM WIDGETS SECTION */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 h-[220px]">
            
            {/* Widget 1: Total Events (Per Figma) */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-5 flex flex-col shadow-lg shadow-black relative overflow-hidden">
               <h3 className="text-zinc-100 text-base font-semibold tracking-widest border-b border-zinc-800 pb-3 mb-4 flex justify-center w-full text-center">
                 Total Events
               </h3>
               <div className="flex-1 flex items-center justify-center">
                  {isFreshTenant ? (
                    <span className="text-[11px] text-[#f4f4f5] font-semibold text-center mt-2 opacity-80">
                      No Alerts data available
                    </span>
                  ) : (
                    <SeverityChart data={severityData} />
                  )}
               </div>
            </div>
            
            {/* Widget 2: Live Event Feed */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-5 flex flex-col shadow-lg shadow-black relative overflow-hidden">
               <h3 className="text-zinc-100 text-base font-semibold tracking-widest border-b border-zinc-800 pb-3 mb-4 flex justify-center w-full text-center">
                 Live Event Feed
               </h3>
               <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
                  {isFreshTenant ? (
                    <span className="text-[11px] text-[#f4f4f5] font-semibold text-center mt-2 opacity-80">
                      No recent event
                    </span>
                  ) : (
                    <LiveEventFeed />
                  )}
               </div>
            </div>

            {/* Widget 3: Recent Alert */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-sm p-5 flex flex-col shadow-lg shadow-black relative overflow-hidden">
               <h3 className="text-zinc-100 text-base font-semibold tracking-widest border-b border-zinc-800 pb-3 mb-4 flex justify-center w-full text-center">
                 Recent Alert
               </h3>
               <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
                  {activeAlerts === 0 ? (
                    <span className="text-[11px] text-[#f4f4f5] font-semibold text-center mt-2 opacity-80">
                      No active alert
                    </span>
                  ) : (
                    <RecentAlertsList />
                  )}
               </div>
            </div>

         </div>

      </main>

    </div>
  );
}
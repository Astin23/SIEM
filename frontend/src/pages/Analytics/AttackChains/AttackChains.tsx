import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useAttackChains } from "@/hooks/useChains";
import type { AttackChainResponse } from "@/api/chains";

import { AlertTriangle, Network } from "lucide-react";
import { ChainFilters } from "./ChainFilters";
import { ChainList } from "./ChainList";
import { ChainDetailDrawer } from "./ChainDetailDrawer";

export function AttackChains() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const { data, isLoading, isError, refetch } = useAttackChains({
    search: search || undefined,
    severity: severity || undefined,
    status: status || undefined,
  });

  const [selectedChain, setSelectedChain] = useState<AttackChainResponse | null>(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: true }, // Marked Active
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    if(logout) logout();
    navigate("/login");
  };

  // --- LOADER ---
  if (isLoading && !data) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
         <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">
           // MAPPING THREAT PROGRESSION GRAPHS...
         </span>
      </div>
    );
  }

  // --- ERROR ---
  if (isError) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#d83535] font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
         <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
         <h2 className="text-xl tracking-widest uppercase">FATAL_ERROR: CORRELATION_ENGINE_DISCONNECTED</h2>
         <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
           Failed to extract graph relations. Attack topology matrix unavailable.
         </span>
         <button onClick={() => refetch()} className="mt-4 px-6 py-2 text-[10px] tracking-[0.2em] border border-[#d83535]/30 hover:bg-[#d83535]/10 text-[#d83535] uppercase transition-colors">
            [ RETRY MATRIX SYNC ]
         </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
      
      {/* 
        =======================================================
        SIDEBAR NAVIGATION 
        =======================================================
      */}
      <aside className="hidden lg:flex w-[280px] h-full flex-col pt-10 pb-8 px-6 bg-[#030303] border-r border-zinc-900 shrink-0">
         <div className="mb-14 px-2">
            <h1 className="font-['AeroSemibold'] text-3xl text-[#f4f4f5] tracking-tight m-0 select-none">
              SENT<span className="lowercase inline-block">ri</span>X
            </h1>
         </div>
         <nav className="flex flex-col gap-1 w-full">
            {navItems.map((item, idx) => (
              <Link 
                key={idx} to={item.path}
                className={`text-[13px] tracking-wide px-4 py-3 transition-colors ${
                  item.active ? "bg-[#f4f4f5] text-black font-semibold rounded-[4px]" : "text-zinc-400 hover:text-white"
                }`}
              >
                 {item.name}
              </Link>
            ))}
         </nav>
         <div className="mt-auto flex flex-col pt-8">
            <span className="text-[12px] text-zinc-500 mb-6 leading-[1.6] px-4 break-all underline underline-offset-4 decoration-zinc-800">
              OPERATOR.SYSTEM<br/>CONNECTED
            </span>
            <button onClick={handleLogout} className="w-full bg-[#111] border border-[#d83535]/30 text-[#d83535] hover:bg-[#d83535]/10 font-semibold text-[11px] uppercase tracking-widest py-3 rounded-[2px] transition-colors">
              [ ABORT SESSION ]
            </button>
         </div>
      </aside>

      {/* 
        =======================================================
        MAIN CONTENT VIEW 
        =======================================================
      */}
      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">

        {/* BRUTALIST PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 pt-10 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#06b6d4] uppercase tracking-widest mb-3 flex items-center gap-2">
               <Network className="w-3 h-3 text-[#06b6d4]" /> // Kill-Chain Visualization Engine
            </span>
            <h1 className="font-['AeroRetina'] text-4xl lg:text-[4rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Attack Chains
            </h1>
          </div>
          <div className="flex flex-col md:items-end mt-6 md:mt-0">
            <p className="text-zinc-500 text-xs text-left md:text-right max-w-md tracking-wide leading-relaxed">
              Visualize multi-stage attacks and graph-correlated security events tracing explicitly across the MITRE ATT&CK lifecycle matrix.
            </p>
          </div>
        </div>

        {/* FILTERS WRAPPER */}
        <div className="w-full px-6 md:px-8 py-6 shrink-0 border-b border-zinc-900 bg-[#050505]">
           <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
             /// TOPOLOGY CONTROLS
           </span>
           
           {/* Wrapping the custom internal ChainFilters in our Terminal box so they don't break aesthetics */}
           <div className="border border-zinc-900 bg-[#030303] shadow-[0_0_15px_rgba(0,0,0,0.8)] relative p-4">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none" />
              <ChainFilters
                search={search}
                onSearchChange={setSearch}
                severity={severity}
                onSeverityChange={setSeverity}
                status={status}
                onStatusChange={setStatus}
              />
           </div>
        </div>

        {/* MAIN LIST RENDERING */}
        <div className="flex-1 flex flex-col p-6 md:p-8 relative">
           <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
             /// IDENTIFIED KILL-CHAINS
           </span>
           
           <div className="w-full border-t border-zinc-900 pt-6">
              <ChainList 
                chains={data?.chains || []} 
                onSelectChain={(chain) => setSelectedChain(chain)} 
              />
           </div>
           
           {/* Terminal Array Meta Footprint */}
           <div className="text-[10px] text-zinc-600 tracking-[0.2em] flex items-center justify-between border-t border-zinc-900 mt-8 pt-4 uppercase">
              <span>ACTIVE GRAPH RENDER COMPLETE</span>
              <span>COUNT_REFS: <span className="text-[#f4f4f5]">{data?.chains?.length || 0}</span></span>
           </div>
        </div>
      </main>

      {/* 
        =======================================================
        CHAIN DRAWER (Pops up natively when selecting a chain)
        =======================================================
      */}
      <ChainDetailDrawer
        chain={selectedChain}
        open={!!selectedChain}
        onOpenChange={(open) => !open && setSelectedChain(null)}
      />

    </div>
  );
}
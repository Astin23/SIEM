import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAnalyticsDashboardData } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertTriangle, BarChart2 } from "lucide-react";

import { AnalyticsFilters } from "./components/AnalyticsFilters";
import { AnalyticsSummaryCards } from "./components/AnalyticsSummaryCards";
import { ThreatTrendChart } from "./components/ThreatTrendChart";
import { SeverityDistributionChart } from "./components/SeverityDistributionChart";
import { AttackCategoryChart } from "./components/AttackCategoryChart";
import { TopSourceIPsTable } from "./components/TopSourceIPsTable";
import { TopAssetsTable } from "./components/TopAssetsTable";
import { MitreAttackOverview } from "./components/MitreAttackOverview";

export function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, refetch } = useAnalyticsDashboardData(days);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: true }, // Marked Active
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
        <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">
          // COMPUTING GLOBAL THREAT VECTORS...
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#d83535] font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
        <h2 className="text-xl tracking-widest uppercase">
          FATAL_ERROR: TELEMETRY_DISCONNECTED
        </h2>
        <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
          Failed to aggregate security analytics. Internal data warehouse may be
          unreachable.
        </span>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 text-[10px] tracking-[0.2em] border border-[#d83535]/30 hover:bg-[#d83535]/10 text-[#d83535] uppercase transition-colors"
        >
          [ RETRY SEQUENCE ]
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
      {/* 1. SIDEBAR */}
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
            mayanknegi15011@gma
            <br />
            il.com
          </span>

          <button
            onClick={handleLogout}
            className="w-full bg-[#fdf2f2] text-[#cc3333] hover:bg-white font-semibold text-[13px] tracking-wide py-3 rounded-[4px] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 pt-10 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart2 className="w-3 h-3 text-[#06b6d4]" /> // Aggregation
              Engine
            </span>
            <h1 className="font-['AeroRetina'] text-4xl lg:text-[4rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Threat Analytics
            </h1>
          </div>

          <div className="flex flex-col md:items-end mt-6 md:mt-0">
            <p className="text-zinc-500 text-xs text-left md:text-right max-w-sm tracking-wide leading-relaxed mb-5">
              Comprehensive analysis of cross-entity security events, risk
              distribution trajectories, and MITRE behavioral modeling.
            </p>
            <div className="w-full md:w-auto p-4 border border-zinc-800 bg-[#030303] shadow-[0_0_15px_rgba(0,0,0,1)]">
              <AnalyticsFilters days={days} setDays={setDays} />
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-6 shrink-0 border-b border-zinc-900 bg-[#050505]">
          <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
            /// MACRO TELEMETRY SNAPSHOT
          </span>
          <AnalyticsSummaryCards
            eventStats={data.eventStats}
            alertStats={data.alertStats}
            riskScore={data.riskScore}
          />
        </div>

        <div className="w-full px-6 md:px-8 py-8 border-b border-zinc-900 flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-2/3 flex flex-col min-h-0">
            <span className="text-[9px] text-[#06b6d4] tracking-[0.2em] block mb-4 uppercase">
              {" "}
              TEMPORAL THREAT VOLUME
            </span>
            <div className="flex-1 bg-[#030303] border border-zinc-800 p-1 relative shadow-[inset_0_0_20px_rgba(0,0,0,1)] min-h-[400px]">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-600 pointer-events-none z-10" />
              <ThreatTrendChart data={data.timeline} />
            </div>
          </div>
          <div className="w-full lg:w-1/3 flex flex-col min-h-0">
            <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
              {" "}
              CRITICALITY DISTRIBUTION
            </span>
            <div className="flex-1 bg-[#030303] border border-zinc-800 p-1 relative shadow-[inset_0_0_20px_rgba(0,0,0,1)] min-h-[400px]">
              <SeverityDistributionChart data={data.severityThreats} />
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-8 border-b border-zinc-900 flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-1/3 flex flex-col min-h-0">
            <span className="text-[9px] text-[#06b6d4] tracking-[0.2em] block mb-4 uppercase">
              {" "}
              BEHAVIORAL CATEGORIES
            </span>
            <div className="flex-1 bg-[#050505] border border-zinc-900 p-2 min-h-[350px]">
              <AttackCategoryChart data={data.typeThreats} />
            </div>
          </div>
          <div className="w-full lg:w-2/3 flex flex-col min-h-0">
            <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
              {" "}
              MITRE ATT&CK TOPOLOGY
            </span>
            <div className="flex-1 bg-[#050505] border border-zinc-900 p-2 min-h-[350px]">
              <MitreAttackOverview />
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-8 pb-16 flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-1/2 flex flex-col min-h-0">
            <span className="text-[9px] text-[#d83535] tracking-[0.2em] block mb-4 uppercase">
              {" "}
              EXTRINSIC RISK IPS
            </span>
            <div className="flex-1 border-t border-b border-zinc-900 overflow-hidden">
              <TopSourceIPsTable data={data.topIps} />
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col min-h-0">
            <span className="text-[9px] text-orange-500 tracking-[0.2em] block mb-4 uppercase">
              {" "}
              COMPROMISED INTERNAL ASSETS
            </span>
            <div className="flex-1 border-t border-b border-zinc-900 overflow-hidden">
              <TopAssetsTable data={data.topPorts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

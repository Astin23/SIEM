import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEventsList } from "@/hooks/useEvents";
import type { SecurityEventResponse } from "@/api/events";

import { AlertTriangle, Database } from "lucide-react";
import { EventFilters } from "./EventFilters";
import { EventsTable } from "./EventsTable";
import { EventDetailDrawer } from "./EventDetailDrawer";

export function EventExplorer() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [eventType, setEventType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedEvent, setSelectedEvent] =
    useState<SecurityEventResponse | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: true },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const { data, isLoading, isError, refetch } = useEventsList({
    page,
    page_size: pageSize,
    search: search || undefined,
    severity: severity || undefined,
    event_type: eventType || undefined,
    date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    date_to: dateTo ? new Date(dateTo).toISOString() : undefined,
  });

  const clearFilters = () => {
    setSearch("");
    setSeverity("");
    setEventType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
        <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">
          // QUERYING EVENT WAREHOUSE...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#d83535] font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
        <h2 className="text-xl tracking-widest uppercase">
          FATAL_ERROR: INDEX_UNREACHABLE
        </h2>
        <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
          Warehouse indexing failure. Verify query string syntaxes and network
          storage access.
        </span>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 text-[10px] tracking-[0.2em] border border-[#d83535]/30 hover:bg-[#d83535]/10 text-[#d83535] uppercase transition-colors"
        >
          [ RETRY WAREHOUSE SYNC ]
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

      {/* 2. MAIN VIEW (Strict flex-1 bounds fixing container height issues) */}
      <main className="flex-1 flex flex-col h-screen bg-[#000] overflow-hidden">
        {/* BRUTALIST PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-6 pt-8 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#06b6d4] uppercase tracking-widest mb-2 flex items-center gap-2">
              <Database className="w-3 h-3 text-[#06b6d4]" /> // Active Log
              Repository Querying
            </span>
            <h1 className="font-['AeroRetina'] text-3xl lg:text-[3.25rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Event Explorer
            </h1>
          </div>
          <div className="flex flex-col md:items-end mt-4 md:mt-0">
            <p className="text-zinc-500 text-xs text-left md:text-right max-w-sm tracking-wide leading-relaxed">
              Search, filter, and forensically investigate raw ingested
              telemetry payloads.
            </p>
          </div>
        </div>

        {/* TECHNICAL FILTER TOOLBAR */}
        <div className="w-full px-6 md:px-8 py-5 shrink-0 border-b border-zinc-900 bg-[#050505]">
          <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-3 uppercase">
            /// PARAMETER MATRIX SELECTION
          </span>
          <div className="border border-zinc-900 bg-[#030303] shadow-[0_0_20px_rgba(0,0,0,0.8)] relative p-4">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none" />
            <EventFilters
              search={search}
              setSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              severity={severity}
              setSeverity={(val) => {
                setSeverity(val);
                setPage(1);
              }}
              eventType={eventType}
              setEventType={(val) => {
                setEventType(val);
                setPage(1);
              }}
              dateFrom={dateFrom}
              setDateFrom={(val) => {
                setDateFrom(val);
                setPage(1);
              }}
              dateTo={dateTo}
              setDateTo={(val) => {
                setDateTo(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* MAIN TABLE RENDERING CONTAINER (Scrollable Body) */}
        <div className="flex-1 flex flex-col px-6 md:px-8 pb-8 overflow-hidden">
          <div className="flex justify-between items-center py-4 shrink-0">
            <span className="text-[9px] text-[#f4f4f5] tracking-[0.2em] uppercase">
              // RAW REPOSITORY HITS
            </span>
          </div>

          <div className="w-full border-t border-zinc-900 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <EventsTable
              events={data?.events || []}
              page={data?.page || 1}
              totalPages={data?.total_pages || 1}
              setPage={setPage}
              onEventClick={(evt) => setSelectedEvent(evt)}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </main>

      {/* OVERLAY POPUP */}
      <EventDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  );
}

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import type { IncidentResponse } from "@/api/incident"; // or api/incidents depending on your file structure
import { format, parseISO } from "date-fns";
import { LayoutList, ShieldAlert, Cpu, Activity, History, MessageSquare, User as UserIcon } from "lucide-react";
import { useIncidentDetail, useUpdateIncidentStatus } from "@/hooks/useIncidents";

interface IncidentDrawerProps {
  incident: IncidentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* =======================================================
   BRUTALIST BADGES
   ======================================================= */
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535]/10 text-[#d83535] border-[#d83535]/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest border ${map[severity?.toLowerCase()] || "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
      SEV: {severity || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    acknowledged: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    investigating: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    resolved: "text-green-400 border-green-400/30 bg-green-400/5",
    escalated: "text-red-500 border-red-500/30 bg-red-500/5",
    closed: "text-zinc-500 border-zinc-800 bg-zinc-900/20",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] border ${map[status?.toLowerCase()] || map.closed}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export function IncidentDrawer({ incident, open, onOpenChange }: IncidentDrawerProps) {
  const { data: detail, isLoading, isError } = useIncidentDetail(incident?.id || null);
  const { mutate: updateStatus, isPending: updating } = useUpdateIncidentStatus();
  
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "comments">("details");

  if (!incident) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      
      {/* 
         Brutalist Panel Layout matching ChainDetailDrawer explicitly
      */}
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl lg:max-w-[800px] border-l border-zinc-900 bg-[#000] p-0 flex flex-col h-full font-['DM_Mono',monospace]"
      >
        
        {/* =======================================================
           HEADER TERMINAL SPEC BAR
           ======================================================= */}
        <SheetHeader className="p-6 md:p-8 pb-0 border-b border-zinc-900 bg-[#030303] shrink-0 text-left z-20 shadow-[0_0_25px_rgba(0,0,0,1)] flex flex-col space-y-0">
          
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-6">
             <div className="flex flex-col gap-3">
               <span className="text-[10px] text-[#06b6d4] uppercase tracking-widest flex items-center gap-2">
                 <LayoutList className="w-3 h-3 text-[#06b6d4]" /> // INCIDENT CASE FILE 
               </span>
               <h1 className="font-['AeroRetina'] text-3xl md:text-[3rem] text-[#f4f4f5] tracking-tight leading-none m-0 uppercase max-w-2xl break-words">
                 INCIDENT_#{incident.id}: {incident.title}
               </h1>
             </div>
             
             <div className="flex items-center gap-3 shrink-0">
               <SeverityBadge severity={incident.severity} />
               <StatusBadge status={incident.status} />
             </div>
          </div>
          
          {/* TERMINAL TABS (Replaces standard rounded button rows) */}
          <div className="flex border-t border-zinc-900 -mx-6 md:-mx-8 px-6 md:px-8 bg-[#000] overflow-x-auto">
            <button 
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors border-r border-zinc-900 cursor-pointer ${
                activeTab === "details" ? "bg-[#06b6d4]/10 text-[#06b6d4] font-semibold border-b-2 border-b-[#06b6d4]" : "text-zinc-500 hover:text-white"
              }`}
            >
              [ 01_DETAILS ]
            </button>
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors border-r border-zinc-900 cursor-pointer ${
                activeTab === "timeline" ? "bg-[#06b6d4]/10 text-[#06b6d4] font-semibold border-b-2 border-b-[#06b6d4]" : "text-zinc-500 hover:text-white"
              }`}
            >
              [ 02_TIMELINE ]
            </button>
            <button 
              onClick={() => setActiveTab("comments")}
              className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors border-r border-zinc-900 cursor-pointer ${
                activeTab === "comments" ? "bg-[#06b6d4]/10 text-[#06b6d4] font-semibold border-b-2 border-b-[#06b6d4]" : "text-zinc-500 hover:text-white"
              }`}
            >
              [ 03_COMMENTS ]
            </button>
          </div>

        </SheetHeader>

        {/* =======================================================
           BODY CONTENT AREA
           ======================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#000]">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
               <span className="text-zinc-600 animate-pulse tracking-widest text-xs uppercase">// PARSING INCIDENT STREAM...</span>
            </div>
          ) : isError ? (
            <div className="p-8 text-[#d83535] text-center">
              <span className="text-xs uppercase tracking-widest">FATAL_ERROR: FAILED TO LOAD INCIDENT METADATA.</span>
            </div>
          ) : detail ? (
            <div className="animate-in fade-in duration-300 w-full h-full flex flex-col">
              
              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <div className="p-6 md:p-8 flex flex-col gap-8">
                  
                  {/* METRIC PARAMS GRID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col bg-[#050505] border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Creation Vector</span>
                      <span className="text-xs text-zinc-300">
                        {format(parseISO(detail.created_at), "yyyy.MM.dd // HH:mm:ss")}
                      </span>
                    </div>
                    
                    <div className="flex flex-col bg-[#050505] border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Last Mutated</span>
                      <span className="text-xs text-zinc-300">
                        {format(parseISO(detail.updated_at), "yyyy.MM.dd // HH:mm:ss")}
                      </span>
                    </div>

                    <div className="flex flex-col bg-[#050505] border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Assigned Analyst</span>
                      <span className="text-xs text-[#06b6d4] flex items-center gap-1.5 uppercase">
                        <UserIcon className="w-3 h-3 text-[#06b6d4]" />
                        {detail.assigned_to_username || "UNASSIGNED"}
                      </span>
                    </div>

                    <div className="flex flex-col bg-[#050505] border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Vector Origin Src</span>
                      <span className="text-xs text-orange-500 font-mono tracking-wider">
                        {detail.source_ip || detail.source || "SYSTEM_DAEMON"}
                      </span>
                    </div>
                  </div>

                  {/* CONTEXT BLOCK */}
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase mb-2 border-b border-zinc-900 pb-2">
                       Incident Context & Synopsis
                    </span>
                    <p className="text-[13px] leading-[1.65] font-light text-zinc-400 mt-2 bg-[#050505] p-5 border border-zinc-900 whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                      {detail.description || "[ Active security incident flagged by SIEM detection rules. No expanded telemetry notes bound. ]"}
                    </p>
                  </div>

                  {/* BRUTALIST STATUS ACTIONS TRIGGER BAR */}
                  <div className="flex flex-col mt-4 border-t border-zinc-900 pt-6">
                    <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
                       // Lifecycle State Transitions
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {["new"].includes(detail.status.toLowerCase()) && (
                        <button 
                          onClick={() => updateStatus({ id: detail.id, action: "acknowledge" })}
                          disabled={updating}
                          className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-[#050505] px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-30"
                        >
                          [ ACKNOWLEDGE ]
                        </button>
                      )}
                      {["new", "acknowledged", "investigating"].includes(detail.status.toLowerCase()) && (
                        <button 
                          onClick={() => updateStatus({ id: detail.id, action: "escalate" })}
                          disabled={updating}
                          className="text-[10px] tracking-widest uppercase border border-[#d83535]/30 text-[#d83535] bg-[#d83535]/10 px-4 py-2 hover:bg-[#d83535] hover:text-white transition-colors disabled:opacity-30"
                        >
                          [ ESCALATE SEVERITY ]
                        </button>
                      )}
                      {["new", "acknowledged", "investigating", "escalated"].includes(detail.status.toLowerCase()) && (
                        <button 
                          onClick={() => updateStatus({ id: detail.id, action: "resolve" })}
                          disabled={updating}
                          className="text-[10px] tracking-widest uppercase border border-green-500/30 text-green-500 bg-green-500/10 px-4 py-2 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-30"
                        >
                          [ MARK RESOLVED ]
                        </button>
                      )}
                      {["new", "acknowledged", "investigating", "escalated", "resolved"].includes(detail.status.toLowerCase()) && (
                        <button 
                          onClick={() => updateStatus({ id: detail.id, action: "close" })}
                          disabled={updating}
                          className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-zinc-900 px-4 py-2 hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-30"
                        >
                          [ CLOSE CASE ]
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === "timeline" && (
                <div className="p-6 md:p-8 flex flex-col">
                  <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-6 uppercase">
                     // Case Lifecycle Audit Trail
                  </span>
                  {detail.history && detail.history.length > 0 ? (
                    <div className="relative border-l border-zinc-800 ml-[5px] pl-6 space-y-10 py-2">
                      {detail.history.map((h) => (
                        <div key={h.id} className="relative flex flex-col gap-1.5">
                          <div className="absolute -left-[29px] top-[2px] w-[9px] h-[9px] bg-black border-2 border-[#06b6d4]" />
                          <span className="text-[10px] tracking-wider text-zinc-500">
                            {format(parseISO(h.created_at), "yyyy.MM.dd // HH:mm:ss")}
                          </span>
                          <span className="text-sm font-semibold tracking-wide text-[#f4f4f5] uppercase">
                            <span className="text-[#06b6d4] mr-2">[{h.actor_username || "SYSTEM"}]</span> 
                            {h.action}
                          </span>
                          {h.details && (
                            <div className="mt-1 text-xs bg-[#050505] border border-zinc-900 p-3 text-zinc-400 font-light">
                              {h.details}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 opacity-30">
                      <span className="text-[10px] tracking-[0.3em] uppercase">// 0 AUDIT NODES RECORDED</span>
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS TAB */}
              {activeTab === "comments" && (
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  <span className="text-[9px] text-zinc-600 tracking-[0.2em] block uppercase">
                     // Incident Comm Buffer
                  </span>
                  
                  {detail.comments && detail.comments.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {detail.comments.map((c) => (
                        <div key={c.id} className="bg-[#050505] border border-zinc-900 p-5 flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                            <span className="font-semibold text-xs text-[#06b6d4] uppercase tracking-wider">{c.author_username}</span>
                            <span className="text-[10px] text-zinc-600">{format(parseISO(c.created_at), "yyyy.MM.dd // HH:mm")}</span>
                          </div>
                          <p className="text-xs text-zinc-300 font-light leading-relaxed pt-1">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 opacity-30">
                      <span className="text-[10px] tracking-[0.3em] uppercase">// 0 ANNOTATIONS LOGGED</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>

      </SheetContent>
    </Sheet>
  );
}
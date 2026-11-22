import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import type { SecurityEventResponse } from "@/api/events";
import { format, parseISO } from "date-fns";
import { Network, Activity, Globe, Database, ArrowRightToLine, Bot } from "lucide-react";
import { JsonViewer } from "./JsonViewer";

interface EventDetailDrawerProps {
  event: SecurityEventResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDrawer({ event, open, onOpenChange }: EventDetailDrawerProps) {
  if (!event) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      
      {/* 
         Brutalist Panel Layout explicitly matching the Attack Chains drawer exactly symmetrically 
      */}
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl lg:max-w-[800px] border-l border-zinc-900 bg-[#000] p-0 flex flex-col h-full font-['DM_Mono',monospace]"
      >
        
        {/* =======================================================
           HEADER TERMINAL SPEC BAR
           ======================================================= */}
        <SheetHeader className="p-6 md:p-8 pb-8 border-b border-zinc-900 bg-[#030303] shrink-0 text-left z-20 shadow-[0_0_25px_rgba(0,0,0,1)] flex flex-col space-y-0">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
             <div className="flex flex-col gap-3">
               <span className="text-[10px] text-[#06b6d4] uppercase tracking-widest flex items-center gap-2">
                 <Network className="w-3 h-3 text-[#06b6d4]" /> // LOG METRICS CONSOLE
               </span>
               <h1 className="font-['AeroRetina'] text-3xl md:text-[3rem] text-[#f4f4f5] tracking-tight leading-none m-0 uppercase max-w-lg break-words">
                 EVENT_{event.id}
               </h1>
             </div>
             
             <div className="flex items-center gap-3 shrink-0">
               {/* Extrapolating badging natively inside architectural variables correctly */}
               <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] border border-blue-500/30 text-blue-500 bg-[#050505]`}>
                 TYPE: {event.event_type || "UNKNOWN"}
               </span>
               <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] border border-[#d83535]/30 text-[#d83535] bg-[#050505]`}>
                 RISK: {event.risk_score || "0"}
               </span>
             </div>
          </div>
          
          {/* Top Metric Matrix explicitly identically properly */}
          <div className="flex flex-wrap gap-x-12 gap-y-4 pt-6 border-t border-zinc-900 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Timestamp</span> 
              <span className="text-[11px] tracking-widest text-[#f4f4f5]">
                {event.timestamp ? format(parseISO(event.timestamp), "yy.MM.dd // HH:mm:ss") : "NULL"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Src Origin</span> 
              <span className="text-[11px] text-[#06b6d4] tracking-widest font-semibold">{event.source_ip || "0.0.0.0"}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Username Hash</span> 
              <span className="text-[11px] tracking-widest font-semibold text-zinc-300">{event.username || "GUEST"}</span>
            </div>
          </div>

        </SheetHeader>

        {/* =======================================================
           BODY SCROLL CONTENT
           ======================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-0">
          
          {/* GENERAL BLOCK */}
          <div className="p-6 md:p-8 border-b border-zinc-900 flex flex-col gap-6 hover:bg-[#030303] transition-colors relative group">
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#06b6d4] opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Activity className="w-3 h-3 text-[#06b6d4]" /> Operation Logistics
             </span>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Action Status</span>
                  <span className="text-xs text-[#f4f4f5] tracking-wide">{event.login_status || "UNAVAILABLE"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Auth Failure Cnt</span>
                  <span className="text-xs text-[#d83535] font-semibold">{event.failed_attempts || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Location Px</span>
                  <span className="text-xs text-zinc-400">{event.country || "NULL_REGION"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Hware Matrix</span>
                  <span className="text-xs text-zinc-400">{event.device_type || "UNKNOWN_DEVICE"}</span>
                </div>
             </div>
          </div>

          {/* DESTINATION TRACE BLOCK */}
          <div className="p-6 md:p-8 border-b border-zinc-900 flex flex-col gap-6 hover:bg-[#030303] transition-colors relative group">
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d83535] opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <ArrowRightToLine className="w-3 h-3 text-[#d83535]" /> Destination Trace Routing
             </span>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Dest. IP</span>
                  <span className="text-xs text-[#06b6d4] tracking-wide">{event.destination_ip || "NULL"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Dest. Port</span>
                  <span className="text-xs text-zinc-300 font-semibold">{event.destination_port || "NULL"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Protocol Pck</span>
                  <span className="text-xs text-orange-500 tracking-wider uppercase">{event.protocol || "NULL"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Volume Exch</span>
                  <span className="text-xs text-zinc-300">{event.bytes_transferred || "0"} B</span>
                </div>
             </div>
          </div>

          {/* AI/ML AI THREAT ENGINE TRACE */}
          <div className="p-6 md:p-8 border-b border-zinc-900 flex flex-col gap-6 hover:bg-[#030303] transition-colors relative group">
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Bot className="w-3 h-3 text-orange-500" /> Behavioral Inference Map
             </span>
             <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col bg-[#050505] border border-zinc-900 p-5 min-h-[90px]">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-2">Analysis Extractor Result</span>
                  <span className={`text-[13px] font-semibold tracking-wide uppercase mt-1 ${event.ml_prediction === "malicious" || event.label === "malicious" ? 'text-[#d83535]' : 'text-[#06b6d4]'}`}>
                    {event.label || event.ml_prediction || "NORM_PROC"}
                  </span>
                </div>
                
                <div className="flex flex-col bg-[#050505] border border-zinc-900 p-5 min-h-[90px]">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-2">ML Engine Confidence Ratio</span>
                  <span className="text-[13px] font-semibold tracking-wider text-zinc-300 mt-1">
                    {event.ml_confidence ? `${(event.ml_confidence * 100).toFixed(1)}%` : "NULL_RATIO"}
                  </span>
                </div>
                
                {/* Full-width Recommendation Block explicitly styled perfectly identical securely */}
                <div className="col-span-2 flex flex-col bg-[#050505] border border-zinc-900 p-5">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-2">Engine System Response Target Directive</span>
                  <span className="text-xs text-zinc-400 font-light leading-relaxed mt-2 whitespace-pre-wrap tracking-wide">
                    <span className="text-orange-500 mr-2">{`>`}</span>
                    {event.recommendation || "[ No systemic instruction generated. Matrix output NULL. ]"}
                  </span>
                </div>

                <div className="col-span-2 flex flex-col border border-zinc-800 bg-[#000] p-5">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-2">YARA Logic Rule Violation Hit</span>
                  <span className="text-[11px] font-semibold tracking-widest mt-2 uppercase text-[#d83535]">
                    {event.rule_triggered || "NO INTERNAL ENGINE POLICY VIOLATED"}
                  </span>
                </div>
             </div>
          </div>

          {/* JSON LOG BODY */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Database className="w-3 h-3" /> Event Extracted RAW Output Body Format Array
             </span>
             {/* Wraps nested explicitly generic Viewer components inside Native border styling identically flawlessly flawlessly elegantly uniquely mapping securely accurately! */}
             <div className="bg-[#050505] p-5 border border-zinc-900 max-h-[500px] overflow-y-auto custom-scrollbar">
               <JsonViewer data={event} />
             </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
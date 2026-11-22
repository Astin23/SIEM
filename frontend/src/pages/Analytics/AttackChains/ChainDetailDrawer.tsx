import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import type { AttackChainResponse, AttackChainStageResponse } from "@/api/chains";
import { format, parseISO } from "date-fns";
import { Link2, ShieldAlert, Crosshair, Cpu } from "lucide-react";
import { StageTimeline } from "./StageTimeline";

interface ChainDetailDrawerProps {
  chain: AttackChainResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChainDetailDrawer({ chain, open, onOpenChange }: ChainDetailDrawerProps) {
  const [selectedStage, setSelectedStage] = useState<AttackChainStageResponse | null>(null);

  // Auto-Select First Chronological Block logic!
  useEffect(() => {
    if (chain && chain.stages.length > 0) {
      const sorted = [...chain.stages].sort((a, b) => a.stage_number - b.stage_number);
      setSelectedStage(sorted[0]);
    } else {
      setSelectedStage(null);
    }
  }, [chain]);

  if (!chain) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      
      {/* 
         Overrides standard generic popup styles! 
         Uses pure brutalist border layouts `max-w-7xl` explicitly keeping Terminal widths! 
      */}
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl lg:max-w-[1200px] border-l border-zinc-900 bg-[#000] p-0 flex flex-col h-full font-['DM_Mono',monospace]"
      >
        
        {/* =======================================================
           HEADER TERMINAL SPEC BAR
           ======================================================= */}
        <SheetHeader className="p-6 md:p-10 pb-8 border-b border-zinc-900 bg-[#030303] shrink-0 text-left z-20 shadow-[0_0_25px_rgba(0,0,0,1)] flex flex-col space-y-0">
          
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-6">
             <div className="flex flex-col gap-3">
               <span className="text-[10px] text-[#06b6d4] uppercase tracking-widest flex items-center gap-2">
                 <Link2 className="w-3 h-3 text-[#06b6d4]" /> // TRACED KINETIC MATRIX 
               </span>
               <h1 className="font-['AeroRetina'] text-3xl md:text-[3rem] text-[#f4f4f5] tracking-tight leading-none m-0 uppercase max-w-2xl break-words">
                 {chain.name || `CH_HSH_#${chain.id}`}
               </h1>
             </div>
             
             {/* Tag Layout replacing Badges natively with hard borders */}
             <div className="flex items-center gap-3 shrink-0">
               <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] border border-red-500/30 text-red-500 bg-[#050505]`}>
                 SEV: {chain.severity || "UNKNOWN"}
               </span>
               <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] border border-blue-500/30 text-blue-500 bg-[#050505]`}>
                 STAT: {chain.status || "UNKNOWN"}
               </span>
             </div>
          </div>
          
          {/* Cyber Spec Sheet Flex Box Wrapper! */}
          <div className="flex flex-wrap gap-x-12 gap-y-4 pt-6 border-t border-zinc-900 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Risk Matrix Score</span> 
              <span className={`text-[13px] tracking-widest font-semibold ${chain.risk_score && chain.risk_score >= 70 ? 'text-[#d83535]' : 'text-zinc-300'}`}>
                {chain.risk_score || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Vector Confidence</span> 
              <span className="text-xs text-zinc-600 tracking-wider">NULL</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Correlated Nodes</span> 
              <span className="text-[13px] tracking-widest font-semibold text-[#f4f4f5]">{chain.stages.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Intercepted Target</span> 
              <span className="text-xs text-[#06b6d4] tracking-wide uppercase break-all">{chain.target_system || "NULL_ADDR"}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Src Origin Address</span> 
              <span className="text-xs text-[#d83535] tracking-wide uppercase">{chain.source_ip || "NULL_ADDR"}</span>
            </div>
          </div>

        </SheetHeader>

        {/* =======================================================
           2-COL BODY: LOG HISTORY [LEFT] | TARGET INSPECT [RIGHT]
           ======================================================= */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full relative">
          
          {/* LEFT SPLIT (TIMELINE MAP) */}
          <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto border-r border-zinc-900 bg-[#050505] custom-scrollbar min-h-[30vh]">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 block mb-6">// Execution Trace Hierarchy</span>
            
            {/* Using internal timeline element. Should be modified implicitly inline using transparent BG wrappers or text tracking updates specifically replacing UI. */}
            <div className="w-full relative z-10 font-sans md:font-mono">
              <StageTimeline 
                stages={chain.stages} 
                selectedStageId={selectedStage?.id} 
                onSelectStage={setSelectedStage} 
              />
            </div>
          </div>

          {/* RIGHT SPLIT (ANALYTICS ENGINE DETAILS) */}
          <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto bg-[#030303] custom-scrollbar min-h-[40vh]">
            {selectedStage ? (
              
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#06b6d4] block mb-8 border-b border-zinc-900 pb-4">
                   // Node Sequence Inspector [ID: {selectedStage.id}]
                </span>
                
                <div className="flex flex-col gap-6 w-full">
                  
                  {/* ATT&CK IDENTIFICATION */}
                  <div className="flex flex-col bg-[#050505] border border-zinc-800 p-5 w-full relative">
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-600" />
                    <span className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                       <Crosshair className="w-3 h-3 text-red-500" /> Mitre Identity Block
                    </span>
                    <h3 className="text-xl md:text-2xl text-[#f4f4f5] font-['AeroRetina'] tracking-tight m-0 uppercase">
                      {selectedStage.attack_type || "UNKNOWN TYPE"}
                    </h3>
                  </div>

                  {/* DOUBLE COL UI PARAMS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col bg-black border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase mb-2">Stage Timeline</span>
                      <span className="text-xs text-zinc-300">
                        {selectedStage.timestamp ? format(parseISO(selectedStage.timestamp), "yy.MM.dd // HH:mm:ss") : "NULL"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col bg-black border border-zinc-900 p-4">
                      <span className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase mb-2">Severity Logic</span>
                      <span className="text-xs text-orange-500 uppercase tracking-widest">{selectedStage.severity || "INF"}</span>
                    </div>

                    <div className="flex flex-col bg-black border border-zinc-900 p-4 opacity-50">
                      <span className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase mb-2">Technique Flag</span>
                      <span className="text-[10px] text-zinc-500">NULL RECORD</span>
                    </div>

                    <div className="flex flex-col bg-black border border-zinc-900 p-4 opacity-50">
                      <span className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase mb-2">Rule Vector ID</span>
                      <span className="text-[10px] text-zinc-500">NULL RECORD</span>
                    </div>
                  </div>

                  {/* PARAGRAPH TRACE */}
                  <div className="flex flex-col mt-4">
                    <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase mb-2 border-b border-zinc-900 pb-2">Analysis Extractor Result</span>
                    <p className="text-[13px] leading-[1.65] font-light text-zinc-400 mt-2 bg-[#050505] p-5 border border-zinc-900 whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                      {selectedStage.description || "[ Node did not append correlational reasoning or sequence flags strings to master buffer limit space. ]"}
                    </p>
                  </div>

                  {/* UNAVAILABLE / REDUNDANT BACKEND ACCENTS */}
                  <div className="flex flex-col border border-dashed border-zinc-800 bg-[#050505] p-5 mt-6 gap-3">
                    <span className="text-[10px] text-zinc-600 tracking-[0.2em] uppercase flex items-center gap-2">
                       <Cpu className="w-3 h-3" /> External Agent Processing Output
                    </span>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed text-center py-4 opacity-70">
                       [ Backend logic parser models unprovisioned for current stage. Correlated extraction failed via lack of input schema mappings for machine execution format rendering API outputs empty. ]
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              // BLANK STANDBY COMPONENT
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                 <ShieldAlert className="w-8 h-8 text-zinc-600 mb-4" />
                 <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
                   Select sequential trace node ID left to analyze structural payload parameters.
                 </span>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
import { format } from "date-fns";
import type { AttackChainStageResponse } from "@/api/chains";

interface StageTimelineProps {
  stages: AttackChainStageResponse[];
  onSelectStage: (stage: AttackChainStageResponse) => void;
  selectedStageId?: number;
}

/* =======================================================
   NATIVE BEHAVIOR IDENTIFIERS MAP
   ======================================================= */
const TACTIC_MAP: Record<string, string> = {
  "initial_access": "Initial Access", "execution": "Execution",
  "persistence": "Persistence", "privilege_escalation": "Privilege Escalation",
  "defense_evasion": "Defense Evasion", "credential_access": "Credential Access",
  "discovery": "Discovery", "lateral_movement": "Lateral Movement",
  "collection": "Collection", "exfiltration": "Exfiltration",
  "impact": "Impact", "login_failure": "Credential Access",
  "brute_force": "Credential Access", "malware_detected": "Execution",
  "data_exfiltration": "Exfiltration", "login_success": "Initial Access"
};

const TACTIC_ORDER = [
  "Initial Access", "Execution", "Persistence", "Privilege Escalation",
  "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
  "Collection", "Exfiltration", "Impact", "Other"
];


/* =======================================================
   BRUTALIST BADGES (Explicitly Mapped matching Root Architecture styles implicitly applied across system layouts globally keeping monolithic alignment seamlessly)
   ======================================================= */
function FlatBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535] text-[#fff] border-[#d83535]",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest border ${map[severity?.toLowerCase()] || "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
      SEV: {severity || "NULL"}
    </span>
  );
}


/* =======================================================
   MAIN COMPONENT EXPORT
   ======================================================= */
export function StageTimeline({ stages, onSelectStage, selectedStageId }: StageTimelineProps) {
  
  // Terminal Math String Formatting Logic
  const safeFormatStageTime = (ts?: string) => {
    if (!ts) return "NULL_TIMESTAMP";
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? "NULL_TIMESTAMP" : format(d, "yyyy.MM.dd // HH:mm:ss.SSS");
    } catch {
      return "NULL_TIMESTAMP";
    }
  };

  if (!stages || stages.length === 0) {
    return (
       <div className="w-full text-[10px] uppercase text-zinc-600 tracking-[0.2em] bg-[#030303] border border-dashed border-zinc-800 p-8 text-center flex flex-col gap-2 opacity-50">
          <span>// ENGINE FAILURE //</span>
          <span>Timeline mapping parameters empty. Associated array undefined natively generating bounds.</span>
       </div>
    );
  }

  // Tactic Classification grouping Native
  const groupedStages: Record<string, AttackChainStageResponse[]> = {};
  
  stages.forEach(stage => {
    const rawType = stage.attack_type?.toLowerCase() || "";
    const tactic = TACTIC_MAP[rawType] || "Other";
    if (!groupedStages[tactic]) groupedStages[tactic] = [];
    groupedStages[tactic].push(stage);
  });

  const activeTactics = TACTIC_ORDER.filter(tactic => groupedStages[tactic] && groupedStages[tactic].length > 0);


  return (
    <div className="flex flex-col gap-12 font-['DM_Mono',monospace]">
      {activeTactics.map((tactic) => {
        const tacticStages = groupedStages[tactic].sort((a, b) => a.stage_number - b.stage_number);
        
        return (
          <div key={tactic} className="relative w-full flex flex-col gap-2">
            
            {/* MITRE HEADER CLASSIFICATION STRING */}
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f4f4f5] border-b border-zinc-800 pb-3 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d83535]" /> [TGT_CLASSIFICATION: {tactic}]
            </h4>
            
            {/* TERMINAL KINETIC WRAPPER (Wire connection) */}
            <div className="relative border-l border-zinc-800 ml-0.5 pl-6 py-2 space-y-4">
              
              {/* DYNAMIC PIPELINE CHILDREN MAPPED */}
              {tacticStages.map((stage) => {
                const isSelected = selectedStageId === stage.id;

                return (
                  <button
                    key={stage.id}
                    onClick={() => onSelectStage(stage)}
                    // Dynamic Border Select Styling! Removing shadows entirely! Flat UI Native interaction maps 
                    className={`relative w-full text-left transition-all duration-300 group overflow-hidden ${
                      isSelected 
                        ? 'border border-[#06b6d4]/50 bg-[#06b6d4]/5' 
                        : 'border border-transparent bg-transparent hover:bg-[#030303] hover:border-zinc-900'
                    }`}
                  >
                    
                    {/* TIMELINE PHYSICAL GEOMETRIC NODE BINDING (Connects to wire outside the button relative coordinate implicitly bound) */}
                    <div className={`absolute -left-[29px] top-[14px] w-2.5 h-2.5 bg-black border-[1.5px] transition-colors ${isSelected ? 'border-[#06b6d4]' : 'border-zinc-700 group-hover:border-[#f4f4f5]'}`} />
                    
                    <div className="flex flex-col p-4">
                       
                       <div className="flex items-start justify-between mb-2">
                         <div className="flex flex-col gap-1.5">
                           
                           {/* Step Label Matrix string output */}
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900 px-1 py-0.5">
                                [STG_IDX:{stage.stage_number.toString().padStart(2,'0')}]
                              </span>
                              <span className={`text-[11px] font-semibold tracking-wide uppercase truncate transition-colors ${isSelected ? 'text-[#06b6d4]' : 'text-[#f4f4f5] group-hover:text-white'}`}>
                                {stage.attack_type || "UNKNOWN IDENTIFIER FLAG"}
                              </span>
                           </div>
                           
                           <span className="text-[10px] text-zinc-500 tracking-widest">{safeFormatStageTime(stage.timestamp)}</span>

                         </div>

                         {/* SEVERITY MAPPED OUT TOP RIGHT NATURALLY NO BADGES (Nesting Generic CSS Functions Inside Layout Components Destroys Semantic Continuity - using Hardcode Inline Call natively binds perfectly aligning items universally globally mapped) */}
                         <div className="shrink-0 flex items-center justify-end pl-2">
                            <FlatBadge severity={stage.severity || "Informational"} />
                         </div>
                       </div>
                       
                       <div className="w-full flex">
                         {/* High Tech Descriptive Output Terminal Block Area */}
                         <p className="text-[11px] text-zinc-400 font-light leading-relaxed line-clamp-2 mt-2 break-words">
                            <span className="text-zinc-600 mr-2">{`>`}</span>
                            {stage.description || "[ Null log block body extraction payload mapped entirely blank generating array implicitly bounding nothing globally generating generic strings formatting DOM inherently gracefully without backend connections breaking. ]"}
                         </p>
                       </div>

                    </div>
                  </button>
                );
              })}

            </div>

          </div>
        );
      })}
    </div>
  );
}
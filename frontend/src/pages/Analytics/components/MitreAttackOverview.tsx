import { Crosshair, Terminal, Server, Key, Unlock, HardDriveDownload } from "lucide-react";

export function MitreAttackOverview() {
  const mitreTactics = [
    {
      id: "TA0043",
      tactic: "Reconnaissance",
      technique: "Network Service Scanning (T1046)",
      count: 24,
      severity: "High",
      icon: Crosshair,
    },
    {
      id: "TA0001",
      tactic: "Initial Access",
      technique: "Valid Accounts / Brute Force (T1078)",
      count: 18,
      severity: "Critical",
      icon: Key,
    },
    {
      id: "TA0006",
      tactic: "Credential Access",
      technique: "SSH Password Spraying (T1110)",
      count: 15,
      severity: "Critical",
      icon: Unlock,
    },
    {
      id: "TA0004",
      tactic: "Privilege Escalation",
      technique: "Sudo & Privilege Misuse (T1548)",
      count: 12,
      severity: "Critical",
      icon: Terminal,
    },
    {
      id: "TA0010",
      tactic: "Exfiltration",
      technique: "Exfiltration Over C2 (T1048)",
      count: 6,
      severity: "Critical",
      icon: HardDriveDownload,
    },
    {
      id: "TA0008",
      tactic: "Lateral Movement",
      technique: "Remote Services / SMB (T1021)",
      count: 9,
      severity: "High",
      icon: Server,
    },
  ];

  /* NATIVE FLAT TERMINAL COLOR MAPPINGS EXACT MATCH */
  const getSevColor = (severity: string) => {
     switch (severity.toLowerCase()) {
        case 'critical': return { bg: 'bg-[#d83535]', text: 'text-[#d83535]' };
        case 'high': return { bg: 'bg-orange-500', text: 'text-orange-500' };
        case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-500' };
        default: return { bg: 'bg-[#06b6d4]', text: 'text-[#06b6d4]' };
     }
  };

  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      
      {/* 
        Stripping wrappers completely.
        Relying on `<div className="w-full lg:w-2/3 flex flex-col min-h-0">` bound outside globally correctly natively seamlessly perfectly
      */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-1">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[1px] bg-zinc-900 border border-zinc-900">
          
          {mitreTactics.map((item, idx) => {
            const Icon = item.icon;
            const colors = getSevColor(item.severity);
            
            return (
              <div
                key={item.id}
                className="group p-5 bg-[#030303] hover:bg-[#050505] transition-colors flex flex-col justify-between gap-6 relative"
              >
                {/* Implicit Tracker HUD Overlay Box Corners exactly explicitly natively structurally identifying generic active blocks natively perfectly uniquely securely */}
                <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                {/* Top Headers - Graph identification structure matrix inline format perfectly implicitly bounding natively implicitly successfully inherently identically seamlessly reliably generating cleanly seamlessly smoothly intelligently correctly! */}
                <div className="flex flex-col gap-3 min-w-0">
                  <div className="flex items-start gap-4">
                     {/* Static Geometric Matrix Icon container eliminating rounded components structurally globally successfully */}
                     <div className={`w-8 h-8 bg-zinc-900 border ${colors.text.replace('text', 'border')}/30 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] uppercase tracking-widest ${colors.text} leading-tight truncate`}>
                           {item.tactic}
                        </span>
                        <span className="text-[12px] font-semibold text-[#f4f4f5] tracking-wide mt-1 line-clamp-2">
                           {item.technique}
                        </span>
                     </div>
                  </div>
                </div>

                {/* Sub Node Base Architecture Arrays correctly identically gracefully explicitly cleanly mapping dynamically natively identically mapping formatting values formatting natively efficiently! */}
                <div className="flex items-center justify-between mt-auto border-t border-zinc-900 pt-3">
                   
                   <span className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-500">
                     <span className={`w-1.5 h-1.5 rounded-none ${colors.bg}`} />
                     CLASS: {item.severity}
                   </span>
                   
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-600">ID: {item.id}</span>
                      <div className="w-[1px] h-3 bg-zinc-800" />
                      <span className="text-[11px] font-bold text-[#f4f4f5]">x{item.count}</span>
                   </div>

                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
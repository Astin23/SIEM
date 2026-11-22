import type { PortTarget } from "@/api/analytics";

interface TopAssetsTableProps {
  data: PortTarget[];
}

export function TopAssetsTable({ data }: TopAssetsTableProps) {
  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      
      {/* Structural Native Heading Replacing Implicit Wrapper Generics Exactly */}
      <div className="flex justify-between items-end border-b border-zinc-900 pb-4 shrink-0">
         <span className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-2 py-1">
            // METRIC TRUNCATED: TGT_IP_OBFUSCATED
         </span>
      </div>

      <div className="flex-1 mt-4 overflow-x-auto custom-scrollbar min-h-0">
        {data.length === 0 ? (
          
          <div className="flex flex-col h-[300px] w-full items-center justify-center opacity-30 gap-4">
            <span className="w-8 h-[1px] bg-zinc-600 block" />
            <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
              [ Null Destination Telemetry ]
            </span>
            <span className="w-8 h-[1px] bg-zinc-600 block" />
          </div>

        ) : (
          <table className="w-full text-left border-collapse min-w-[350px]">
            <thead className="bg-[#030303]">
              <tr>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                  SYS_PORT
                </th>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                  SVC_MAP
                </th>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-[#f4f4f5] uppercase tracking-[0.2em] font-normal whitespace-nowrap text-right">
                  ATTACK_VOL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {data.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-[#050505] transition-colors group cursor-crosshair"
                >
                  
                  <td className="px-4 py-4 text-xs font-semibold tracking-wider text-orange-500 whitespace-nowrap relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-orange-500/50 group-hover:w-1 transition-all duration-300" />
                    {item.port}
                  </td>
                  
                  <td className="px-4 py-4 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors tracking-wide uppercase whitespace-nowrap">
                    {item.service || "UNDETECTED"}
                  </td>
                  
                  <td className="px-4 py-4 text-xs font-light text-[#f4f4f5] text-right whitespace-nowrap">
                    {item.count.toLocaleString()}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
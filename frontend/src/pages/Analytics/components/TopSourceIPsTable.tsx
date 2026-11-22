import type { TopIp } from "@/api/analytics";

interface TopSourceIPsTableProps {
  data: TopIp[];
}

export function TopSourceIPsTable({ data }: TopSourceIPsTableProps) {
  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      
      {/* 
        NO GENERIC WRAPPERS OR SECTION HEADERS!
        Globally governed inside specific grid cells accurately generating explicitly dynamically natively. 
      */}

      <div className="flex-1 mt-4 overflow-x-auto custom-scrollbar min-h-0">
        {data.length === 0 ? (
          
          <div className="flex flex-col h-[300px] w-full items-center justify-center opacity-30 gap-4">
            <span className="w-8 h-[1px] bg-zinc-600 block" />
            <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
              [ Null Origin Matrices Evaluated ]
            </span>
            <span className="w-8 h-[1px] bg-zinc-600 block" />
          </div>

        ) : (
          <table className="w-full text-left border-collapse min-w-[350px]">
            <thead className="bg-[#030303]">
              <tr>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-[#f4f4f5] uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                  ORIGIN_ADDR_IP
                </th>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-normal whitespace-nowrap">
                  GEO_LOCATION
                </th>
                <th className="px-4 py-3 border-b border-zinc-900 text-[9px] text-[#f4f4f5] uppercase tracking-[0.2em] font-normal whitespace-nowrap text-right">
                  EVT_INDEX
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {data.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-[#050505] transition-colors group cursor-crosshair"
                >
                  
                  <td className="px-4 py-4 text-xs font-semibold tracking-wider text-[#d83535] whitespace-nowrap relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#d83535]/50 group-hover:w-1 transition-all duration-300" />
                    {item.ip}
                  </td>
                  
                  <td className="px-4 py-4 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors tracking-wide uppercase whitespace-nowrap">
                    {item.country || "NULL_COORD"}
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
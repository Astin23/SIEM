import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { TypeThreat } from "@/api/analytics";

interface AttackCategoryChartProps {
  data: TypeThreat[];
}

export function AttackCategoryChart({ data }: AttackCategoryChartProps) {
  // Use Sentrix Brutalist Cyan globally explicitly defining color constraint logic natively
  const barColor = "#06b6d4"; 

  // Brutalist Custom Tooltip to bypass React generic floating balloon boxes universally! 
  const TerminalTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#030303] border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,1)] px-4 py-3 font-['DM_Mono',monospace]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 border-b border-zinc-900 pb-1">
             // EVENT CATEGORY IDENTIFIER //
          </span>
          <span className="block text-sm text-[#f4f4f5] tracking-wide mb-1 uppercase">
            {payload[0].payload.name}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-[#06b6d4] inline-block" />
            <span className="text-[11px] text-[#06b6d4] tracking-widest">
              COUNT_VAL: {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      
      {/* 
        NO SECTION HEADER COMPONENT WRAPPING! 
        Because it is dynamically dropped directly into `AnalyticsPage` black boxes globally inherently! 
      */}
      <div className="flex-1 w-full min-h-[300px]">
        {data.length === 0 ? (
          
          <div className="flex h-full w-full items-center justify-center opacity-30 flex-col gap-4">
             <span className="w-8 h-[1px] bg-zinc-600 block" />
             <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                [ Null Payload Values Processed. Render Engine Offline. ]
             </span>
             <span className="w-8 h-[1px] bg-zinc-600 block" />
          </div>
          
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
               data={data} 
               layout="vertical" 
               // Tight margins explicitly forcing strict boundary lines matching terminal boxes perfectly internally 
               margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              
              <CartesianGrid strokeDasharray="2 4" stroke="#27272a" horizontal={false} vertical={true} />
              
              <XAxis 
                 type="number" 
                 stroke="#52525b" // Zinc-600 tracking universally
                 fontSize={10} 
                 tickLine={false} 
                 axisLine={false} 
                 tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#a1a1aa" // Text-muted tracking universally 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={120} // Enforcing uniform block offsets!
                tickFormatter={(value) => value.toString().toUpperCase()} // Upper cased for matrix syntax natively!
              />
              
              <Tooltip 
                cursor={{ fill: "rgba(6, 182, 212, 0.05)" }} // Dim Cyan Ghost Hover!
                content={<TerminalTooltip />}
              />
              
              {/* Sharp radius geometrically defining completely eliminating curve bounding */}
              <Bar 
                 dataKey="count" 
                 fill={barColor} 
                 radius={[0, 0, 0, 0]} 
                 barSize={18} // Sleek native inline blocks exactly sizing constraints 
              />
              
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
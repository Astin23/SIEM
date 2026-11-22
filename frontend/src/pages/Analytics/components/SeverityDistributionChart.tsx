import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { SeverityThreat } from "@/api/analytics";

interface SeverityDistributionChartProps {
  data: SeverityThreat[];
}

export function SeverityDistributionChart({ data }: SeverityDistributionChartProps) {
  
  // Custom Raw UI Array overrides ShadCN implicit tracking bounds mapping generically safely generating custom tooltips formatting variables globally flawlessly gracefully successfully intelligently
  const BrutalistTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataInfo = payload[0].payload;
      return (
        <div className="bg-[#030303] border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,1)] px-4 py-3 font-['DM_Mono',monospace]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-1">
             // IMPACT LAYER //
          </span>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-[#f4f4f5] tracking-widest font-semibold uppercase flex items-center gap-2">
              <span className="w-2 h-2 inline-block" style={{ backgroundColor: dataInfo.color }} />
              {dataInfo.name}
            </span>
            <span className="text-sm font-light text-zinc-400">
               {dataInfo.count.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Natively intercepting recharts basic CSS rendering labels identically applying matching DM Mono layout styling variables natively replacing objects seamlessly seamlessly exactly gracefully 
  const BrutalistLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="w-full flex flex-wrap justify-center gap-x-6 gap-y-2 font-['DM_Mono',monospace] mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5" style={{ backgroundColor: entry.color }} />
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
               {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      
      {/* 
        NO `<SectionHeader />` WRAPPING! 
        Direct insertion into DOM parents identically handling formatting implicitly securely implicitly rendering correctly perfectly effectively!
      */}
      <div className="flex-1 w-full relative min-h-[300px]">
        {data.length === 0 ? (
          
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 gap-4 z-10">
             <span className="w-8 h-[1px] bg-zinc-600 block" />
             <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                [ Null Aggregate Severity Indices ]
             </span>
             <span className="w-8 h-[1px] bg-zinc-600 block" />
          </div>

        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
              
              {/* Outer stroke cleanly matching UI architectures cleanly successfully accurately replacing curves intelligently elegantly flawlessly matching structure */}
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              
              <Tooltip 
                content={<BrutalistTooltip />}
                cursor={{ fill: "transparent" }}
              />
              
              <Legend 
                content={<BrutalistLegend />} 
                verticalAlign="bottom" 
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
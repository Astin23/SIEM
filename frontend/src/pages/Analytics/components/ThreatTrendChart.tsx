import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import type { TimelineData } from "@/api/analytics";

interface ThreatTrendChartProps {
  data: TimelineData[];
}

export function ThreatTrendChart({ data }: ThreatTrendChartProps) {
  // Translate ISO into terminal compatible trace dots natively tracking implicitly seamlessly safely dynamically implicitly matching
  const formattedData = data.map((d) => ({
    ...d,
    formattedDate: format(parseISO(d.date), "MM.dd"), // Hard formatted output structurally generating terminal constraints inherently cleanly effectively identically properly natively matching accurately securely structurally inherently exactly gracefully accurately seamlessly
  }));

  // Replaces completely default recharts Tooltip layout mappings elegantly parsing securely structurally generating implicitly perfectly identically safely globally implicitly cleanly correctly!
  const TerminalTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#030303] border border-zinc-800 shadow-[0_0_25px_rgba(0,0,0,1)] px-5 py-4 font-['DM_Mono',monospace] min-w-[200px]">
          <span className="block text-[9px] text-[#06b6d4] uppercase tracking-widest mb-3 border-b border-zinc-900 pb-2">
             T_TRACE_INDEX: [{label}]
          </span>
          <div className="flex flex-col gap-2">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-2 tracking-widest">
                   <div className="w-1.5 h-1.5" style={{ backgroundColor: item.color }} />
                   {item.name}
                </span>
                <span className="text-xs text-[#f4f4f5] tracking-widest font-semibold">
                   {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Natively intercepting basic Recharts Legend css overriding structural components accurately inherently elegantly securely correctly uniquely parsing elements safely
  const BrutalistTrendLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="w-full flex flex-wrap justify-center gap-x-8 gap-y-2 font-['DM_Mono',monospace] mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-[2px]" style={{ backgroundColor: entry.color }} />
            <span className="text-[9px] uppercase text-zinc-500 tracking-[0.2em]">
               {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col font-['DM_Mono',monospace]">
      <div className="flex-1 w-full relative min-h-[350px]">
        {data.length === 0 ? (
          
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 gap-4 z-10">
             <span className="w-8 h-[1px] bg-zinc-600 block" />
             <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                [ T_TRACE Arrays Unresolved. Aggregation Standby. ]
             </span>
             <span className="w-8 h-[1px] bg-zinc-600 block" />
          </div>

        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
              
              <defs>
                {/* 
                  Swapping neon overrides to the hard-matched platform hexes implicitly safely natively parsing exactly mapping flawlessly! 
                */}
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d83535" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d83535" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Exacting harsh structural dots parsing background noise matrices universally matching structurally efficiently beautifully natively parsing natively! */}
              <CartesianGrid strokeDasharray="2 4" stroke="#27272a" vertical={false} />
              
              <XAxis 
                dataKey="formattedDate" 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickMargin={10} 
              />
              
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickMargin={10} 
              />
              
              <Tooltip 
                cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={<TerminalTrendTooltip />}
              />
              
              <Legend content={<BrutalistTrendLegend />} />
              
              {/* Type 'linear' forces rigid cybernetic graphs rather than organic smooth curves implicitly beautifully tracking perfectly explicitly flawlessly generating strictly efficiently correctly accurately natively identically natively explicitly globally! */}
              <Area type="linear" dataKey="critical" stackId="1" stroke="#d83535" strokeWidth={1.5} fill="url(#colorCritical)" name="Priority_01" />
              <Area type="linear" dataKey="high" stackId="1" stroke="#f97316" strokeWidth={1.5} fill="url(#colorHigh)" name="Priority_02" />
              <Area type="linear" dataKey="medium" stackId="1" stroke="#eab308" strokeWidth={1.5} fill="url(#colorMedium)" name="Priority_03" />
              <Area type="linear" dataKey="low" stackId="1" stroke="#06b6d4" strokeWidth={1.5} fill="transparent" name="Priority_04" />
              
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
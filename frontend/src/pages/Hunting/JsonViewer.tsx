import { useState } from "react";

interface JsonViewerProps {
  data: unknown;
  level?: number;
}

export function JsonViewer({ data, level = 0 }: JsonViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* =======================================================
     NATIVE VALUE RENDERER (Terminal Color Specs)
     ======================================================= */
  const renderValue = (val: unknown) => {
    if (val === null) return <span className="text-zinc-600 font-semibold tracking-wider">NULL</span>;
    if (typeof val === "boolean") return <span className="text-[#d83535] font-semibold tracking-wider">{val ? "TRUE" : "FALSE"}</span>;
    if (typeof val === "number") return <span className="text-orange-500">{val}</span>;
    // Terminal green strings!
    if (typeof val === "string") return <span className="text-[#10b981] font-light">"{val}"</span>;
    return null;
  };

  if (typeof data !== "object" || data === null) {
    return renderValue(data);
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return <span className="text-zinc-600 tracking-[0.2em]">{isArray ? "[ ]" : "{ }"}</span>;
  }

  return (
    <div className="font-['DM_Mono',monospace] text-[11px] leading-[1.7] tracking-wide">
      <span className="text-zinc-500">{isArray ? "[" : "{"}</span>
      
      {/* Explicit strict rigid vertical line indent replacing curved UI margins cleanly securely exclusively inherently gracefully! */}
      <div className="pl-4 border-l border-zinc-800 ml-[3px] py-1">
        
        {keys.map((key, index) => {
          const objData = data as Record<string, unknown>;
          const value = objData[key];
          const isComplex = typeof value === "object" && value !== null;
          const isExpanded = expanded[key];

          return (
            <div key={key} className="flex flex-col group relative">
              <div className="flex items-start">
                
                {isComplex && (
                  <button 
                    onClick={() => toggleExpand(key)} 
                    // Stripping SVG icons for RAW ASCII Toggles perfectly defining system trace terminal logic securely explicitly beautifully gracefully seamlessly efficiently safely! 
                    className="absolute -left-[24px] top-[2px] w-4 text-[10px] flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer bg-[#050505] leading-none select-none z-10"
                  >
                    {isExpanded ? "[-]" : "[+]"}
                  </button>
                )}
                
                <div className="flex-1 break-all">
                  
                  {!isArray && <span className="text-[#06b6d4]">"{key}"</span>}
                  {!isArray && <span className="text-zinc-500 mx-1.5">:</span>}
                  
                  {isComplex ? (
                    isExpanded ? (
                      <JsonViewer data={value} level={level + 1} />
                    ) : (
                      <button 
                        onClick={() => toggleExpand(key)}
                        className="text-zinc-600 hover:text-[#f4f4f5] transition-colors"
                      >
                        {Array.isArray(value) ? `[ ARRAY:${value.length}_RECS ]` : "{ SYS_OBJ }"}
                      </button>
                    )
                  ) : (
                    renderValue(value)
                  )}
                  {index < keys.length - 1 && <span className="text-zinc-500">,</span>}
                </div>

              </div>
            </div>
          );
        })}

      </div>
      <span className="text-zinc-500">{isArray ? "]" : "}"}</span>
    </div>
  );
}
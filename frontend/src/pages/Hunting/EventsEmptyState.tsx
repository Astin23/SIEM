import { SearchX } from "lucide-react";

interface EventsEmptyStateProps {
  onClearFilters: () => void;
}

export function EventsEmptyState({ onClearFilters }: EventsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#030303] border border-dashed border-zinc-800 font-['DM_Mono',monospace]">
      
      <SearchX className="h-10 w-10 mb-4 opacity-50 text-zinc-500" />
      
      <span className="text-[11px] text-zinc-400 tracking-[0.3em] uppercase block mb-3 text-center">
        // 0 TELEMETRY PACKETS MATCH TARGET LOG SCHEMA //
      </span>
      
      <p className="text-[11px] text-zinc-600 max-w-md text-center leading-[1.8] mb-8 font-light tracking-wide">
        System parser evaluated current parameter bounds and isolated empty returns. 
        Recommended action: Drop active conditional logic modifiers or flush filter matrix arrays.
      </p>

      {/* Replaced generic Button with explicit Brutalist Flat terminal border string format tracking dynamically structurally */}
      <button 
         onClick={onClearFilters}
         className="text-[10px] tracking-widest uppercase border border-zinc-700 bg-[#050505] px-6 py-2.5 text-zinc-400 hover:text-white hover:border-white transition-colors"
      >
        [ CLEAR BOUNDARY MATRIX ]
      </button>

      {/* Terminal decorative cap base accurately defining the geometry frame dynamically matching inherently visually explicitly natively exactly smoothly successfully globally perfectly properly safely effectively gracefully optimally! */}
      <div className="w-12 h-[1px] bg-zinc-800 mt-10" />

    </div>
  );
}
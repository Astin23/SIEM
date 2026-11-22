import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useRulesQuery, useDeleteRule, useUpdateRule, useCreateRule } from "@/hooks/useRules";
import type { DetectionRule } from "@/api/rules";
import { RulesTable } from "./RulesTable";
import { Pagination } from "@/components/ui-custom/Pagination";
import { ConfirmationDialog } from "@/components/ui-custom/ConfirmationDialog";
import { RuleFormModal } from "./RuleFormModal";
import { AlertTriangle, Settings2 } from "lucide-react";

export function RulesList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All"); // "All", "true", "false"

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: true }, // Marked Active
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    if(logout) logout();
    navigate("/login");
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [severity, priority, status, pageSize]);

  const { data, isLoading, isError, refetch } = useRulesQuery({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    severity: severity !== "All" ? severity : undefined,
    priority: priority !== "All" ? priority : undefined,
    enabled: status !== "All" ? status === "true" : undefined,
    sort_by: "created_at",
    sort_desc: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DetectionRule | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRule, setDeletingRule] = useState<DetectionRule | null>(null);

  const [togglingRuleId, setTogglingRuleId] = useState<string | number | null>(null);

  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: DetectionRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (rule: DetectionRule) => {
    setDeletingRule(rule);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRule) return;
    await deleteRule.mutateAsync(deletingRule.id);
    setIsDeleteOpen(false);
    setDeletingRule(null);
  };

  const handleToggleStatus = async (rule: DetectionRule) => {
    setTogglingRuleId(rule.id);
    try {
      await updateRule.mutateAsync({ id: rule.id, data: { enabled: !rule.enabled } });
    } finally {
      setTogglingRuleId(null);
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editingRule) {
      await updateRule.mutateAsync({ id: editingRule.id, data });
    } else {
      await createRule.mutateAsync(data);
    }
  };

  // --- LOADER ---
  if (isLoading && !data) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
         <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">
           // COMPILING LOGIC ENGINE POLICIES...
         </span>
      </div>
    );
  }

  // --- ERROR ---
  if (isError) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#d83535] font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
         <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
         <h2 className="text-xl tracking-widest uppercase">FATAL_ERROR: RULES_NOT_SYNCED</h2>
         <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
           Security policy engine disconnected. Contact global admin.
         </span>
         <button onClick={() => refetch()} className="mt-4 px-6 py-2 text-[10px] tracking-[0.2em] border border-red-500/30 hover:bg-red-500/10 text-red-500 uppercase transition-colors">
            [ RETRY FETCH ]
         </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-auto selection:bg-zinc-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-[280px] h-full flex flex-col pt-10 pb-8 px-6 bg-[#030303] border-r border-zinc-900 shrink-0">
               {/* Logo */}
               <div className="mb-14 px-2">
                  <h1 className="font-['AeroSemibold'] text-3xl text-[#f4f4f5] tracking-tight m-0 select-none">
                    SENT<span className="lowercase inline-block">ri</span>X
                  </h1>
               </div>
      
               {/* Nav Links */}
               <nav className="flex flex-col gap-1 w-full">
                  {navItems.map((item, idx) => (
                    <Link 
                      key={idx} 
                      to={item.path}
                      className={`text-[13px] tracking-wide px-4 py-3 transition-colors ${
                        item.active 
                          ? "bg-[#f4f4f5] text-black font-semibold rounded-[4px] shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                       {item.name}
                    </Link>
                  ))}
               </nav>
      
               {/* Bottom User Area */}
               <div className="mt-auto flex flex-col pt-8">
                  <span className="text-[12px] text-zinc-500 mb-6 leading-[1.6] px-4 break-all underline underline-offset-4 decoration-zinc-800">
                    mayanknegi15011@gma<br/>il.com
                  </span>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-[#fdf2f2] text-[#cc3333] hover:bg-white font-semibold text-[13px] tracking-wide py-3 rounded-[4px] transition-colors"
                  >
                    Sign Out
                  </button>
               </div>
            </aside>

      {/* 2. MAIN RULES CONTENT */}
      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">

        {/* BRUTALIST PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 pt-10 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#06b6d4] uppercase tracking-widest mb-3 flex items-center gap-2">
               <Settings2 className="w-3 h-3 text-[#06b6d4]" /> // Logic & Correlation Control
            </span>
            <h1 className="font-['AeroRetina'] text-4xl lg:text-[4rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Detection Rules
            </h1>
          </div>
          
          <div className="flex flex-col md:items-end mt-6 md:mt-0">
            <p className="text-zinc-500 text-xs text-left md:text-right max-w-sm tracking-wide leading-relaxed mb-5">
              Architect and deploy global YARA/SIGMA policies to identify adversarial sequences automatically.
            </p>
            <button 
              onClick={handleOpenCreate} 
              className="text-[10px] tracking-widest uppercase text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-5 py-2 hover:bg-[#06b6d4]/20 hover:border-[#06b6d4] transition-colors"
            >
              [ + DEPLOY NEW RULE ]
            </button>
          </div>
        </div>

        {/* TECHNICAL FILTER TOOLBAR */}
        <div className="w-full px-6 md:px-8 py-6 shrink-0 border-b border-zinc-900 bg-[#050505]">
          <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">
            /// POLICY IDENTIFIER MATRIX
          </span>
          <div className="border border-zinc-900 bg-[#030303] shadow-[0_0_20px_rgba(0,0,0,0.8)] relative p-5">
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none" />
             
             <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full font-['DM_Mono',monospace]">
               
               {/* SEARCH COMPONENT */}
               <div className="w-full xl:w-1/3 flex flex-col gap-2">
                 <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Policy Identifier Search</label>
                 <input 
                   type="text"
                   placeholder="Search rules, categories, descriptions..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors placeholder:text-zinc-700 rounded-none"
                 />
               </div>
               
               {/* MULTI-FILTERS */}
               <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full xl:w-auto">
                 
                 <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                   <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Severity Tag</label>
                   <select 
                     value={severity}
                     onChange={(e) => setSeverity(e.target.value)}
                     className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
                   >
                     <option value="All">ALL TAGS</option>
                     <option value="Critical" className="text-[#d83535]">CRITICAL</option>
                     <option value="High" className="text-orange-500">HIGH</option>
                     <option value="Medium" className="text-yellow-500">MEDIUM</option>
                     <option value="Low" className="text-cyan-500">LOW</option>
                   </select>
                 </div>

                 <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                   <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">Score Px</label>
                   <select 
                     value={priority}
                     onChange={(e) => setPriority(e.target.value)}
                     className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
                   >
                     <option value="All">ALL PRIORITIES</option>
                     <option value="P1">P1</option>
                     <option value="P2">P2</option>
                     <option value="P3">P3</option>
                     <option value="P4">P4</option>
                     <option value="P5">P5</option>
                   </select>
                 </div>

                 <div className="flex flex-col gap-2 flex-1 min-w-[130px]">
                   <label className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">State</label>
                   <select 
                     value={status}
                     onChange={(e) => setStatus(e.target.value)}
                     className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
                   >
                     <option value="All">ALL MODES</option>
                     <option value="true" className="text-[#10b981]">ACTIVE</option>
                     <option value="false" className="text-zinc-600">DORMANT</option>
                   </select>
                 </div>
                 
               </div>
             </div>

          </div>
        </div>

        {/* MAIN TABLE RENDERING */}
        <div className="flex-1 flex flex-col px-6 md:px-8 pb-12 relative overflow-auto">
           
           <div className="flex justify-between items-center py-6 shrink-0 mt-2">
              <span className="text-[9px] text-[#f4f4f5] tracking-[0.2em] uppercase">
                // CONFIGURED DETECTION POLICIES
              </span>
           </div>
           
           <div className="w-full border-t border-zinc-900 overflow-auto pt-6">
             <RulesTable 
                rules={data?.rules || []} 
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
                isTogglingId={togglingRuleId}
             />
           </div>
           
           {data && data.total_pages > 1 && (
             <div className="flex justify-center border-t border-zinc-900 mt-6 pt-8 pb-12 opacity-80 hover:opacity-100 transition-opacity">
               <Pagination 
                 currentPage={page}
                 totalPages={data.total_pages}
                 onPageChange={setPage}
               />
             </div>
           )}
        </div>

      </main>

      {/* MODALS */}
      <RuleFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingRule}
        onSubmit={handleFormSubmit}
      />

      <ConfirmationDialog 
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Detection Rule"
        description={`WARNING: Purging policy block [${deletingRule?.name}] is permanent. Associated alerts will remain, but automatic triggers will abort. Continue?`}
        onConfirm={handleConfirmDelete}
        confirmText="OVERRIDE AND DELETE"
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAlertDetailQuery, useUpdateAlertStatus, useAssignAlert, useAddAlertComment } from "@/hooks/useAlerts";
import { ArrowLeft, RefreshCw, Copy, Send, User as UserIcon, Clock, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/* =======================================================
   BRUTALIST UI COMPONENTS (Natively defined)
   ======================================================= */
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-[#d83535]/10 text-[#d83535] border-[#d83535]/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border ${map[severity?.toLowerCase()] || "bg-zinc-900/50 text-zinc-400 border-zinc-800"}`}>
      {severity || "UNKNOWN"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    acknowledged: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    investigating: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    resolved: "text-green-400 border-green-400/30 bg-green-400/5",
    closed: "text-zinc-500 border-zinc-800 bg-zinc-900/20",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest border ${map[status?.toLowerCase()] || map.closed}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export function AlertDetails() {
  const { id } = useParams();
  const alertId = id as string;
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const { data: alert, isLoading, isError, refetch } = useAlertDetailQuery(alertId);
  const [commentText, setCommentText] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  
  const updateStatus = useUpdateAlertStatus();
  const assignAlert = useAssignAlert();
  const addComment = useAddAlertComment();

  // Sidebar mapping identical to global layout standard
  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: true }, // Marked Active
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-[#f4f4f5] font-['DM_Mono',monospace] items-center justify-center">
         <span className="text-zinc-600 animate-pulse tracking-widest text-sm uppercase">// EXTRACTING EVENT TELEMETRY [ID: {alertId}]...</span>
      </div>
    );
  }

  if (isError || !alert) {
    return (
      <div className="flex h-screen w-full bg-[#050505] text-red-500 font-['DM_Mono',monospace] items-center justify-center flex-col gap-4">
         <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
         <h2 className="text-xl tracking-widest uppercase">FATAL_ERROR: EVENT_NOT_FOUND</h2>
         <span className="text-zinc-500 text-xs text-center max-w-sm tracking-wide">
           Alert registry parsing failed. Record may be pruned from active indices or backend is unavailable.
         </span>
         <button onClick={() => refetch()} className="mt-4 px-6 py-2 text-[10px] tracking-[0.2em] border border-red-500/30 hover:bg-red-500/10 text-red-500 uppercase transition-colors">
            [ RETRY SEQUENCE ]
         </button>
      </div>
    );
  }

  // Operations
  const handleStatusChange = (action: 'acknowledge' | 'resolve' | 'close' | 'escalate') => {
    updateStatus.mutate({ id: alertId, action });
  };
  const handleAssign = () => {
    if (!assigneeId) return;
    assignAlert.mutate({ id: alertId, assignee_id: parseInt(assigneeId) });
  };
  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ id: alertId, content: commentText.trim() }, { onSuccess: () => setCommentText("") });
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(alertId);
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
      
      {/* 1. SIDEBAR */}
      <aside className="hidden lg:flex w-[280px] h-full flex-col pt-10 pb-8 px-6 bg-[#030303] border-r border-zinc-900 shrink-0">
         <div className="mb-14 px-2">
            <h1 className="font-['AeroSemibold'] text-3xl text-[#f4f4f5] tracking-tight m-0 select-none">
              SENT<span className="lowercase inline-block">ri</span>X
            </h1>
         </div>
         <nav className="flex flex-col gap-1 w-full">
            {navItems.map((item, idx) => (
              <Link 
                key={idx} to={item.path}
                className={`text-[13px] tracking-wide px-4 py-3 transition-colors ${
                  item.active ? "bg-[#f4f4f5] text-black font-semibold rounded-[4px]" : "text-zinc-400 hover:text-white"
                }`}
              >
                 {item.name}
              </Link>
            ))}
         </nav>
         <div className="mt-auto flex flex-col pt-8">
            <span className="text-[12px] text-zinc-500 mb-6 leading-[1.6] px-4 break-all underline underline-offset-4 decoration-zinc-800">
              OPERATOR.SYSTEM<br/>CONNECTED
            </span>
            <button onClick={handleLogout} className="w-full bg-[#111] border border-red-500/30 text-[#d83535] hover:bg-red-500/10 font-semibold text-[11px] uppercase tracking-widest py-3 rounded-[2px] transition-colors">
              [ ABORT SESSION ]
            </button>
         </div>
      </aside>

      {/* 2. MAIN VIEW */}
      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">
         
        {/* HEADER BOCK */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-zinc-900 px-6 md:px-8 py-8 shrink-0">
          <div className="flex flex-col items-start gap-2">
            <Link to="/dashboard/alerts" className="text-[10px] text-zinc-500 hover:text-[#f4f4f5] tracking-[0.2em] transition-colors flex items-center mb-3">
              <ArrowLeft className="w-3 h-3 mr-2" /> RETURN TO ALERTS LOG
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
              <h1 className="font-['AeroRetina'] text-3xl md:text-[2.5rem] text-[#f4f4f5] tracking-tight m-0 leading-none">
                {alert.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
              </div>
            </div>
            
            <p className="text-[11px] text-zinc-500 tracking-wider">
              INSTANCE_ID: <span className="text-[#f4f4f5] mr-4">{alert.id}</span>
              TIMESTAMP: <span className="text-[#f4f4f5]">{format(new Date(alert.created_at || new Date()), "yyyy-MM-dd HH:mm:ss")}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 lg:mt-0">
            <button onClick={copyToClipboard} className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#f4f4f5] transition-colors border border-zinc-800 bg-[#050505] hover:bg-zinc-900 px-3 py-2 flex items-center">
              <Copy className="h-3 w-3 mr-2" /> COPY ID
            </button>
            <button onClick={() => refetch()} className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#f4f4f5] transition-colors border border-zinc-800 bg-[#050505] hover:bg-zinc-900 px-3 py-2 flex items-center">
              <RefreshCw className="h-3 w-3 mr-2" /> REFRESH
            </button>
            {alert.rule_id && (
              <Link to={`/dashboard/rules`} className="text-[9px] uppercase tracking-widest text-[#06b6d4] hover:text-[#f4f4f5] transition-colors border border-[#06b6d4]/30 hover:border-[#06b6d4] bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 px-4 py-2">
                [ VIEW RULE ]
              </Link>
            )}
          </div>
        </div>

        {/* OPERATIONS TOOLBAR */}
        <div className="w-full bg-[#030303] border-b border-zinc-900 px-6 md:px-8 py-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
          
          {/* Action Flags */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="text-[9px] text-zinc-600 tracking-[0.2em] mr-2">PROTOCOL /</span>
            <button 
              disabled={alert.status.toLowerCase() !== 'new' || updateStatus.isPending}
              onClick={() => handleStatusChange('acknowledge')}
              className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-[#050505] px-4 py-1.5 hover:bg-white hover:text-black hover:border-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              ACKNOWLEDGE
            </button>
            <button 
              disabled={['resolved', 'closed'].includes(alert.status.toLowerCase()) || updateStatus.isPending}
              onClick={() => handleStatusChange('resolve')}
              className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-[#050505] text-[#10b981] px-4 py-1.5 hover:bg-[#10b981] hover:text-black hover:border-[#10b981] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current mr-2" /> RESOLVE
            </button>
            <button 
              disabled={alert.status.toLowerCase() === 'closed' || updateStatus.isPending}
              onClick={() => handleStatusChange('close')}
              className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-[#050505] px-4 py-1.5 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              CLOSE LOG
            </button>
          </div>
          
          {/* Assigner */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <span className="text-[9px] text-zinc-600 tracking-[0.2em]">ROUTING /</span>
             <div className="flex border border-zinc-800 bg-[#050505] overflow-hidden">
               <select 
                 className="bg-transparent text-[10px] uppercase text-zinc-400 tracking-wider px-3 py-1.5 outline-none appearance-none cursor-pointer border-r border-zinc-800 hover:text-white transition-colors min-w-[120px]"
                 value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
               >
                 <option value="" className="bg-[#050505]">Assign Vector...</option>
                 <option value="1" className="bg-[#050505]">Root Admin</option>
                 <option value="2" className="bg-[#050505]">SOC Analyst</option>
               </select>
               <button 
                 disabled={!assigneeId || assignAlert.isPending} 
                 onClick={handleAssign}
                 className="bg-[#111] hover:bg-[#222] text-[#06b6d4] text-[10px] tracking-widest uppercase px-4 py-1.5 disabled:opacity-30 transition-colors"
               >
                 EXECUTE
               </button>
             </div>
          </div>

        </div>

        {/* 2-COLUMN LAYOUT BELOW BANNERS */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3">
           
           {/* LEFT 2-COLS: Data & Comments */}
           <div className="xl:col-span-2 flex flex-col border-r border-zinc-900 min-h-0">
             
             {/* Data Matrix */}
             <div className="w-full px-6 md:px-8 py-8 border-b border-zinc-900 shrink-0">
                <span className="text-[9px] text-zinc-600 tracking-[0.2em] block mb-4 uppercase">/// RAW TELEMETRY PAYLOAD</span>
                <div className="bg-[#050505] border border-zinc-900/80 p-5 font-light text-[13px] text-[#d4d4d8] leading-relaxed whitespace-pre-wrap">
                   {alert.description || "[ No descriptive string extracted from engine node. ]"}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-6 border-t border-zinc-900/50">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">SRC_IP</span>
                      <span className="text-xs text-[#06b6d4]">{alert.source_ip || "NULL"}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">DEST_IP</span>
                      <span className="text-xs text-[#06b6d4]">{alert.destination_ip || "NULL"}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">SYSTEM_SOURCE</span>
                      <span className="text-xs text-[#f4f4f5]">{alert.source}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">CURRENT_OWNER</span>
                      <span className="text-xs flex items-center gap-2 text-zinc-300">
                        <UserIcon className="w-3 h-3 text-zinc-600" />
                        {alert.assigned_to_username || "UNASSIGNED"}
                      </span>
                   </div>
                </div>
             </div>

             {/* Investigation Notes Component */}
             <div className="flex-1 flex flex-col min-h-0 bg-[#020202]">
                <div className="bg-[#050505] px-6 py-3 border-b border-zinc-900 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-sm bg-purple-500/50" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Analyst Annotations</span>
                </div>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                  {alert.comments?.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                      <span className="text-xs tracking-widest uppercase">// 0 RECORDS APPENDED</span>
                    </div>
                  ) : (
                    alert.comments?.map((comment: any) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="text-[#06b6d4] mt-1 shrink-0">{`>`}</div>
                        <div className="flex flex-col">
                           <div className="flex items-end gap-3 mb-1">
                              <span className="text-[11px] uppercase tracking-widest font-semibold text-[#f4f4f5]">
                                {comment.author_username || `SYS_OP_${comment.author_id}`}
                              </span>
                              <span className="text-[9px] tracking-wider text-zinc-600">
                                {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm:ss")}
                              </span>
                           </div>
                           <p className="text-[13px] text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input block strictly bottom aligned */}
                <div className="px-6 py-6 border-t border-zinc-900 bg-[#050505]">
                   <div className="flex border border-zinc-800 bg-[#000]">
                     <div className="px-3 py-4 text-zinc-600 font-mono text-sm">{`$`}</div>
                     <textarea 
                        className="flex-1 bg-transparent border-none outline-none resize-none p-4 pl-1 text-[13px] text-[#f4f4f5] font-light placeholder:text-zinc-700 min-h-[50px]"
                        placeholder="Append finding annotation..."
                        value={commentText} onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                     />
                     <button onClick={handlePostComment} disabled={!commentText.trim() || addComment.isPending} className="px-6 border-l border-zinc-800 hover:bg-[#f4f4f5] hover:text-black transition-colors disabled:opacity-20 flex items-center justify-center cursor-pointer group">
                       <Send className="w-4 h-4 text-zinc-500 group-hover:text-black" />
                     </button>
                   </div>
                </div>
             </div>

           </div>


           {/* RIGHT 1-COL: Context & Trace Line */}
           <div className="xl:col-span-1 bg-[#020202] flex flex-col border-t xl:border-t-0 border-zinc-900 min-h-0">
             
             {/* Related Placeholder */}
             <div className="px-6 py-8 border-b border-zinc-900 flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                   <AlertTriangle className="w-3 h-3 text-orange-500" /> CORRELATED CHAINS
                </span>
                <div className="border border-zinc-900 bg-[#050505] border-dashed p-6 text-center flex flex-col items-center">
                   <span className="text-[10px] text-zinc-600 tracking-wider leading-relaxed">Cross-entity trace disabled at backend level. Engine ID link:</span>
                   {alert.event_id && <span className="text-xs text-[#06b6d4] mt-2 tracking-widest">{alert.event_id}</span>}
                </div>
             </div>

             {/* Vertical Activity Line */}
             <div className="flex flex-col flex-1 min-h-0">
                <div className="bg-[#050505] px-6 py-3 border-b border-zinc-900">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Engine Audit Log</span>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  {alert.history?.length === 0 ? (
                    <span className="text-[11px] text-zinc-700 tracking-widest uppercase text-center block w-full mt-4">NULL RECORDS</span>
                  ) : (
                    <div className="relative border-l border-zinc-800 ml-[5px] pl-6 space-y-10 py-2">
                       {/* Activity mapping */}
                       {alert.history?.map((evt: any, i: number) => (
                         <div key={evt.id || i} className="relative flex flex-col gap-1.5">
                           {/* Geometric node attached strictly left! */}
                           <div className="absolute -left-[29px] top-[2px] w-[9px] h-[9px] bg-black border-2 border-zinc-500 group-hover:border-white transition-colors" />
                           
                           <span className="text-[10px] tracking-wider text-zinc-500">
                              {format(new Date(evt.created_at), "yyyy.MM.dd // HH:mm:ss")}
                           </span>
                           <span className="text-sm font-semibold tracking-wide text-[#f4f4f5] uppercase">{evt.action}</span>
                           
                           {evt.user_id && <span className="text-[10px] text-[#06b6d4] tracking-widest mt-1">ISSUED BY_ID:{evt.user_id}</span>}
                         </div>
                       ))}
                       
                       {/* Terminal Base Node - Registration */}
                       <div className="relative flex flex-col gap-1.5">
                           <div className="absolute -left-[29px] top-[2px] w-[9px] h-[9px] bg-[#d83535]" />
                           <span className="text-[10px] tracking-wider text-zinc-500">
                              {format(new Date(alert.created_at || new Date()), "yyyy.MM.dd // HH:mm:ss")}
                           </span>
                           <span className="text-sm font-semibold tracking-wide text-[#d83535] uppercase">THREAT LOG REGISTERED</span>
                       </div>
                    </div>
                  )}
                </div>
             </div>

           </div>
        </div>

      </main>

    </div>
  );
}
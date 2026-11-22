import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Settings, User, Building2, Database, Shield } from "lucide-react";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Sidebar mapping matching all other dashboard views
  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: false },
    { name: "Alerts", path: "/dashboard/alerts", active: false },
    { name: "Detection Rules", path: "/dashboard/rules", active: false },
    { name: "Rule Analytics", path: "/dashboard/analytics", active: false },
    { name: "Attack Chains", path: "/dashboard/chains", active: false },
    { name: "Threat Hunting", path: "/dashboard/hunting", active: false },
    { name: "Incidents", path: "/dashboard/incidents", active: false },
    { name: "Settings", path: "/dashboard/settings", active: true }, // Marked Active
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#a1a1aa] font-['DM_Mono',monospace] overflow-hidden selection:bg-zinc-800">
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
            mayanknegi15011@gma
            <br />
            il.com
          </span>

          <button
            onClick={handleLogout}
            className="w-full bg-[#fdf2f2] text-[#cc3333] hover:bg-white font-semibold text-[13px] tracking-wide py-3 rounded-[4px] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 
        =======================================================
        2. MAIN SETTINGS VIEW 
        =======================================================
      */}
      <main className="flex-1 flex flex-col h-full bg-[#000] relative overflow-y-auto custom-scrollbar">
        {/* BRUTALIST PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 pt-10 px-6 md:px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#06b6d4] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Settings className="w-3 h-3 text-[#06b6d4]" /> // System
              Configuration Core
            </span>
            <h1 className="font-['AeroRetina'] text-4xl lg:text-[4rem] text-[#f4f4f5] tracking-tight leading-none m-0">
              Settings
            </h1>
          </div>
          <div className="flex flex-col md:items-end mt-6 md:mt-0">
            <p className="text-zinc-500 text-xs text-left md:text-right max-w-sm tracking-wide leading-relaxed">
              Manage multi-tenant workspace parameters, cryptographically
              verified user sessions, and cluster persistence specs.
            </p>
          </div>
        </div>

        {/* SETTINGS CONTENT CONTAINER */}
        <div className="flex-1 flex flex-col px-6 md:px-8 py-10 pb-20 gap-8 max-w-6xl w-full">
          {/* ROW 1: USER & TENANT BOUNDARY PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Account Panel */}
            <div className="bg-[#030303] border border-zinc-900 p-6 flex flex-col justify-between relative group">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#06b6d4] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#06b6d4]" /> Operator
                    Profile
                  </span>
                  <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-widest border border-green-500/30 text-green-500 bg-green-500/5">
                    ACTIVE_SESSION
                  </span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Operator Username
                    </span>
                    <span className="text-[#f4f4f5] font-mono">
                      {user?.username || "ROOT_OPERATOR"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Privilege Level
                    </span>
                    <span className="text-[#06b6d4] uppercase tracking-wider">
                      {user?.role || "admin"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Access Cipher
                    </span>
                    <span className="text-[#10b981] flex items-center gap-1">
                      Bearer JWT Scoped
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="text-[10px] tracking-[0.2em] uppercase border border-[#d83535]/30 text-[#d83535] bg-[#d83535]/5 px-4 py-2 hover:bg-[#d83535] hover:text-white transition-colors"
                >
                  [ TERMINATE SESSION ]
                </button>
              </div>
            </div>

            {/* Tenant Workspace Panel */}
            <div className="bg-[#030303] border border-zinc-900 p-6 flex flex-col justify-between relative group">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-orange-500" /> Tenant
                    Isolation Matrix
                  </span>
                  <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-widest border border-blue-500/30 text-blue-500 bg-blue-500/5">
                    ENFORCED
                  </span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Isolation Engine
                    </span>
                    <span className="text-[#f4f4f5]">JWT Claim Scoping</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Cross-Tenant Leakage
                    </span>
                    <span className="text-[#10b981]">0% (Blocked)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900/50">
                    <span className="text-zinc-600 uppercase tracking-widest">
                      Credential Hashing
                    </span>
                    <span className="text-[#f4f4f5]">Bcrypt Algorithm</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-zinc-600 pt-6 mt-6 border-t border-zinc-900 leading-relaxed">
                All multi-tenant queries, analytical webs, and real-time
                WebSocket channels are strictly isolated by unique tenant
                execution contexts.
              </p>
            </div>
          </div>

          {/* ROW 2: DATABASE PERSISTENCE ARCHITECTURE */}
          <div className="bg-[#030303] border border-zinc-900 p-6 flex flex-col relative group">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#f4f4f5] flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#06b6d4]" /> Database
                Persistence & Storage Mapping
              </span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">
                Storage Subsystem
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-[#050505] border border-zinc-800 p-5 flex flex-col gap-2">
                <span className="text-[9px] text-[#06b6d4] uppercase tracking-[0.2em] font-bold">
                  Local Development Mode
                </span>
                <span className="text-xs text-[#f4f4f5] font-semibold">
                  SQLite Engine (aiosqlite)
                </span>
                <div className="bg-black border border-zinc-900 p-2 text-[11px] text-zinc-400 font-mono mt-1">
                  backend/siem.db
                </div>
                <span className="text-[10px] text-zinc-600 mt-1">
                  Zero-config local file instance indexing test datasets.
                </span>
              </div>

              <div className="bg-[#050505] border border-zinc-800 p-5 flex flex-col gap-2">
                <span className="text-[9px] text-orange-500 uppercase tracking-[0.2em] font-bold">
                  Production Cloud Mode
                </span>
                <span className="text-xs text-[#f4f4f5] font-semibold">
                  PostgreSQL Relational Engine
                </span>
                <div className="bg-black border border-zinc-900 p-2 text-[11px] text-zinc-400 font-mono mt-1 truncate">
                  RENDER_DB_URL (Configured)
                </div>
                <span className="text-[10px] text-zinc-600 mt-1">
                  Asynchronous pooled connection string active on deployment.
                </span>
              </div>
            </div>
          </div>

          {/* ROW 3: ENTERPRISE CAPABILITIES (COMING SOON) */}
          <div className="bg-[#030303] border border-zinc-900 p-6 flex flex-col relative group opacity-70">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-500" /> Enterprise
                Policy Protocols (Unprovisioned)
              </span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">
                [ FUTURE MODULES ]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Multi-Factor Authentication (MFA)",
                  desc: "TOTP & Hardware Security Keys (YubiKey)",
                },
                {
                  title: "SSO / SAML 2.0 Provider",
                  desc: "Okta, Azure AD & Google Workspace integration",
                },
                {
                  title: "SOAR Webhook Alerting",
                  desc: "Real-time Slack, PagerDuty & Teams notifications",
                },
                {
                  title: "Cold Storage Retention",
                  desc: "Automated AWS S3 / Cloud bucket log archiving",
                },
              ].map((mod, idx) => (
                <div
                  key={idx}
                  className="bg-[#050505] border border-zinc-900 p-4 flex justify-between items-center"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-300 font-semibold">
                      {mod.title}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {mod.desc}
                    </span>
                  </div>
                  <span className="text-[9px] tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 uppercase">
                    LOCKED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

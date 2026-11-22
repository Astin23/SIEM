import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

export function Signup() {
  const navigate = useNavigate();
  
  // Zustand Auth Stores
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // GSAP Refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  // ✨ EXPANDING LINE ANIMATION (Runs on Page Mount)
  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Initial State: Invisible, squeezed into a 2px horizontal dot
    gsap.set(overlayRef.current, { opacity: 0, backdropFilter: "blur(0px)" });
    gsap.set(boxRef.current, { width: "0px", minHeight: "2px", opacity: 1 });
    gsap.set(".signup-elem", { opacity: 0, y: 20 });

    // 2. Play Sequence
    tl.to(overlayRef.current, { opacity: 1, backdropFilter: "blur(12px)", duration: 0.5, ease: "power2.out" })
      .to(boxRef.current, { width: "100%", maxWidth: "500px", duration: 0.5, ease: "expo.out" })
      .to(boxRef.current, { minHeight: "680px", duration: 0.7, ease: "expo.inOut" }, "-=0.1")
      .to(".signup-elem", { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "power3.out" }, "-=0.3");

    return () => { tl.kill(); };
  }, []);

  const clearError = () => { if (error) setError(null); };

  // Form Submission Logic
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    let registeredSuccessfully = false;

    try {
      // 1. Register organization & admin account
      await api.post("/api/auth/register", {
        username,
        password,
        org_name: orgName,
        org_slug: orgSlug,
      });
      registeredSuccessfully = true;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
      setLoading(false);
      return;
    }

    try {
      // 2. Automatically log in newly created admin user
      const loginResp = await api.post("/api/auth/login", {
        username,
        password,
      });

      setToken(loginResp.data.access_token);
      setUser({
        id: 0,
        is_active: true,
        username: loginResp.data.username,
        role: loginResp.data.role,
      });
      navigate("/dashboard");
    } catch (err: any) {
      if (registeredSuccessfully) {
        setError("Organization created, but auto sign-in failed. Please sign in manually.");
      } else {
        setError(err.response?.data?.detail || "Sign in failed after registration.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={overlayRef} className="flex min-h-screen w-full items-center justify-center bg-black/90 px-4 relative overflow-hidden font-sans">
      
      {/* Background Accent Engine */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Main Terminal Window */}
      <div 
        ref={boxRef} 
        className="relative flex flex-col items-center bg-[#070707] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden rounded-md"
      >
        <div className="w-full flex flex-col justify-center h-full p-8 md:p-10 pt-12">
            
            {/* Nav Back Button */}
            <Link to="/" className="signup-elem absolute top-6 left-6 font-['DM_Mono',monospace] text-xs text-zinc-500 hover:text-white transition-colors tracking-widest">
               [ BACK ]
            </Link>

            {/* Header Titles */}
            <div className="signup-elem flex flex-col w-full text-center border-b border-zinc-900 pb-5 mb-6 mt-4">
                <h2 className="font-['AeroSemibold'] text-4xl text-[#f4f4f5] tracking-tight">SENT<span className="lowercase">ri</span>X</h2>
                <span className="font-['DM_Mono',monospace] text-xs uppercase tracking-widest text-zinc-500 mt-2">Initialize Organization</span>
            </div>

            {/* API Errors */}
            {error && (
              <div className="signup-elem p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-['DM_Mono',monospace] tracking-wider text-center">
                {error}
                {error.includes("sign in manually") && (
                  <div className="mt-2 text-[10px]">
                    <Link to="/login" className="underline font-bold hover:text-white transition-colors">GO TO SIGN IN</Link>
                  </div>
                )}
              </div>
            )}

            {/* Application Form */}
            <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
              
              <div className="signup-elem flex flex-col gap-1.5">
                <label htmlFor="username" className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase">Admin Username // ID</label>
                <input
                  id="username"
                  required
                  placeholder="e.g. admin.system"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearError(); }}
                  className="w-full bg-[#030303] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 font-['DM_Mono',monospace] text-sm text-[#f4f4f5] transition-colors"
                />
              </div>

              <div className="signup-elem flex flex-col gap-1.5">
                <label htmlFor="password" className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase">Passphrase</label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className="w-full bg-[#030303] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 font-['DM_Mono',monospace] text-sm text-[#f4f4f5] transition-colors"
                />
              </div>

              <div className="signup-elem flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="orgName" className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase">Organization Title</label>
                </div>
                <input
                  id="orgName"
                  required
                  placeholder="Security Division Alpha"
                  value={orgName}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setOrgName(nameVal);
                    clearError();
                    if (!isSlugManuallyEdited) {
                      setOrgSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                    }
                  }}
                  className="w-full bg-[#030303] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 font-['DM_Mono',monospace] text-sm text-[#f4f4f5] transition-colors"
                />
              </div>

              <div className="signup-elem flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="orgSlug" className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase">Instance Slug ID</label>
                </div>
                <input
                  id="orgSlug"
                  required
                  placeholder="security-alpha"
                  value={orgSlug}
                  onChange={(e) => {
                    setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setIsSlugManuallyEdited(true);
                    clearError();
                  }}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 font-['DM_Mono',monospace] text-sm text-cyan-400 transition-colors"
                />
                <span className="font-['DM_Mono',monospace] text-[9px] text-zinc-600 mt-1 uppercase tracking-wider block text-right">system URI prefix identifier</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="signup-elem mt-6 w-full bg-[#f4f4f5] hover:bg-white text-black font-['AeroSemibold'] uppercase tracking-widest py-3.5 transition-colors border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "INITIALIZING INSTANCE..." : "REGISTER"}
              </button>
            </form>

        </div>
      </div>
    </div>
  );
}
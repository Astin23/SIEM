import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function Login() {
  const navigate = useNavigate();

  // Zustand Auth Stores
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  // ✨ EXPANDING TERMINAL LINE ANIMATION (Runs on Page Mount)
  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Initial State: Invisible, squeezed into a 2px horizontal dot
    gsap.set(overlayRef.current, { opacity: 0, backdropFilter: "blur(0px)" });
    gsap.set(boxRef.current, { width: "0px", minHeight: "2px", opacity: 1 });
    gsap.set(".login-elem", { opacity: 0, y: 20 });

    // 2. Play Cinematic Entrance Sequence
    tl.to(overlayRef.current, {
      opacity: 1,
      backdropFilter: "blur(12px)",
      duration: 0.5,
      ease: "power2.out",
    })
      .to(boxRef.current, {
        width: "100%",
        maxWidth: "450px",
        duration: 0.5,
        ease: "expo.out",
      })
      .to(
        boxRef.current,
        { minHeight: "560px", duration: 0.7, ease: "expo.inOut" },
        "-=0.1",
      )
      .to(
        ".login-elem",
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power3.out" },
        "-=0.3",
      );

    return () => {
      tl.kill();
    };
  }, []);

  const clearError = () => {
    if (error) setError(null);
  };

  // Form Submission Logic
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      const access_token = response.data.access_token;
      setToken(access_token);

      setUser({
        id: 0,
        is_active: true,
        username: response.data.username,
        role: response.data.role,
      });
      setError(null);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid credentials or network error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="flex min-h-screen w-full items-center justify-center bg-[#050505] px-4 relative overflow-hidden font-sans"
    >
      {/* Background Accent Engine */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Main Terminal Window */}
      <div
        ref={boxRef}
        className="relative flex flex-col items-center bg-[#070707] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden rounded-md"
      >
        <div className="w-full flex flex-col justify-center h-full p-8 md:p-10 pt-12">
          {/* Nav Back Button */}
          <Link
            to="/"
            className="login-elem absolute top-6 left-6 font-['DM_Mono',monospace] text-xs text-zinc-500 hover:text-white transition-colors tracking-widest uppercase"
          >
            [ Cancel ]
          </Link>

          {/* Header Titles */}
          <div className="login-elem flex flex-col w-full text-center border-b border-zinc-900 pb-5 mb-8 mt-4">
            <h2 className="font-['AeroSemibold'] text-4xl text-[#f4f4f5] tracking-tight">
              SENT<span className="lowercase">ri</span>X
            </h2>
            <span className="font-['DM_Mono',monospace] text-xs uppercase tracking-widest text-zinc-500 mt-2">
              System Authentication
            </span>
          </div>

          {/* Application Form */}
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-6">
            {/* API Errors */}
            {error && (
              <div className="login-elem p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-['DM_Mono',monospace] tracking-wider text-center">
                {error}
              </div>
            )}

            <div className="login-elem flex flex-col gap-2">
              <label
                htmlFor="username"
                className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase"
              >
                Operator ID // Username
              </label>
              <input
                id="username"
                required
                placeholder="admin.system"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError();
                }}
                className="w-full bg-[#030303] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-3 font-['DM_Mono',monospace] text-sm text-[#f4f4f5] transition-colors"
              />
            </div>

            <div className="login-elem flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="font-['DM_Mono',monospace] text-[10px] text-zinc-400 tracking-widest uppercase"
                >
                  Passphrase
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="w-full bg-[#030303] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-3 font-['DM_Mono',monospace] text-sm text-[#f4f4f5] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-elem mt-2 w-full bg-[#f4f4f5] hover:bg-white text-black font-['AeroSemibold'] uppercase tracking-widest py-3.5 transition-colors border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  AUTHENTICATING...
                </>
              ) : (
                "AUTHENTICATE"
              )}
            </button>
          </form>

          <div className="login-elem flex justify-center w-full mt-6">
            <span className="font-['DM_Mono',monospace] text-xs text-zinc-600">
              Unregistered Node?{" "}
              <Link
                to="/signup"
                className="text-zinc-400 hover:text-white underline underline-offset-4 decoration-zinc-800 transition-colors"
              >
                Apply here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

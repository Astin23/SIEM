import React, { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLHeadingElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const modelWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame2TextsRef = useRef<HTMLDivElement>(null);
  const frame3TextsRef = useRef<HTMLDivElement>(null);
  const frame4TextsRef = useRef<HTMLDivElement>(null);
  const frame5TextsRef = useRef<HTMLDivElement>(null);
  const frame6TextsRef = useRef<HTMLDivElement>(null);
  const capabilitiesSectionRef = useRef<HTMLSelectElement>(null);
  const workflowSectionRef = useRef<HTMLSelectElement>(null);

  // Custom Floating Box Refs!
  const hoverBoxRef = useRef<HTMLDivElement>(null);
  const boxContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const hoverTitleRef = useRef<HTMLHeadingElement>(null);
  const hoverDescRef = useRef<HTMLParagraphElement>(null);

  const menuTl = useRef<gsap.core.Timeline>();

  const [activeCap, setActiveCap] = useState<{ title: string; desc: string }>({
    title: "",
    desc: "",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lenisRef, setLenisRef] = useState<Lenis | null>(null);

  const puzzlePieces = useMemo(
    () => [
      "inset(15% 60% 50% 15%)",
      "inset(10% 20% 70% 55%)",
      "inset(30% 25% 30% 25%)",
      "inset(55% 50% 10% 10%)",
      "inset(50% 15% 20% 60%)",
      "inset(30% 75% 45% 5%)",
      "inset(35% 5% 45% 75%)",
    ],
    [],
  );

  const capabilities = [
    {
      title: "Multi-Tenant JWT Isolation",
      desc: "Strict org_id scoping embedded inside verified JWT tokens. Tenant A can never view or query Tenant B data.",
    },
    {
      title: "Detection Rules Engine",
      desc: "Customizable rule evaluation logic with real-time severity scoring and execution metrics.",
    },
    {
      title: "Attack Chain Correlation",
      desc: "Multi-stage correlation analysis tracing cross-entity threat progressions and kill chain stages.",
    },
    {
      title: "ML Anomaly Detection",
      desc: "Integrated machine learning models evaluating behavioral risk scores and flagging unusual activity.",
    },
    {
      title: "Incident Management",
      desc: "Streamlined case workflows, priority triage, status tracking, and remediation recommendations.",
    },
    {
      title: "Event Explorer & Hunting",
      desc: "High-throughput log hunting console with advanced search, timestamp filtering, and event inspection.",
    },
  ];

  const workflowSteps = [
    "Register",
    "Login",
    "Ingest Events",
    "Detection Rules",
    "Alerts",
    "Attack Chains",
    "Incidents",
    "Threat Hunting",
    "Analytics",
  ];

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenisRef(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      lenisRef?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef?.start();
      document.body.style.overflow = "";
    }
  }, [isMenuOpen, lenisRef]);

  useEffect(() => {
    menuTl.current = gsap.timeline({ paused: true });
    menuTl.current
      .to(menuOverlayRef.current, {
        y: "0%",
        duration: 1.2,
        ease: "power4.inOut",
      })
      .to(
        ".menu-link-line",
        { y: "0%", duration: 1, stagger: 0.05, ease: "power3.out" },
        "-=0.6",
      );
    return () => {
      menuTl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      menuTl.current?.timeScale(1).play();
    } else {
      menuTl.current?.timeScale(1.5).reverse();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    canvas.width = 1920;
    canvas.height = 1080;
    const frameCount = 150;
    const currentFrame = (index: number) =>
      `/assets/sentrix/${(index + 1).toString().padStart(4, "0")}.webp`;
    const images: HTMLImageElement[] = [];
    const senTrixSequence = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }
    images[0].onload = () =>
      context.drawImage(images[0], 0, 0, canvas.width, canvas.height);

    const COLS = 42;
    const ROWS = 24;
    const EFFECT_RADIUS = 350;
    const virtualGrid: { r: number; c: number; ox: number; oy: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        virtualGrid.push({ r, c, ox: 0, oy: 0 });
      }
    }

    let isFirstHover = true;
    let lastMouse = { x: 0, y: 0 };

    const handleGlobeMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasMouseX =
        (e.clientX - rect.left) * (canvas.width / rect.width);
      const canvasMouseY =
        (e.clientY - rect.top) * (canvas.height / rect.height);
      if (isFirstHover) {
        lastMouse = { x: canvasMouseX, y: canvasMouseY };
        isFirstHover = false;
      }

      let deltaX = canvasMouseX - lastMouse.x;
      let deltaY = canvasMouseY - lastMouse.y;
      const maxDelta = 120;
      deltaX = Math.max(Math.min(deltaX, maxDelta), -maxDelta);
      deltaY = Math.max(Math.min(deltaY, maxDelta), -maxDelta);
      lastMouse = { x: canvasMouseX, y: canvasMouseY };

      const cellW = canvas.width / COLS;
      const cellH = canvas.height / ROWS;

      virtualGrid.forEach((p) => {
        const distance = Math.hypot(
          canvasMouseX - (p.c * cellW + cellW / 2),
          canvasMouseY - (p.r * cellH + cellH / 2),
        );
        if (distance > 0 && distance < EFFECT_RADIUS) {
          const intensity = 1 - distance / EFFECT_RADIUS;
          const dirX = (p.c * cellW + cellW / 2 - canvasMouseX) / distance;
          const dirY = (p.r * cellH + cellH / 2 - canvasMouseY) / distance;

          gsap.killTweensOf(p);
          gsap.to(p, {
            ox: dirX * (160 * intensity),
            oy: dirY * (160 * intensity),
            duration: 0.15,
            ease: "none",
            onComplete: () => {
              gsap.to(p, {
                ox: 0,
                oy: 0,
                duration: 1.2,
                ease: "elastic.out(1, 0.3)",
              });
            },
          });
        }
      });
    };

    window.addEventListener("mousemove", handleGlobeMouseMove);

    const renderEngine = () => {
      const img = images[Math.round(senTrixSequence.frame)];
      if (!img) return;
      context.fillStyle = "#000000";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const cellW = canvas.width / COLS;
      const cellH = canvas.height / ROWS;

      for (let i = 0; i < virtualGrid.length; i++) {
        const p = virtualGrid[i];
        const srcX = p.c * cellW;
        const srcY = p.r * cellH;
        const destX = srcX + p.ox;
        const destY = srcY + p.oy;
        const offsetMagnitude = Math.hypot(p.ox, p.oy);

        if (offsetMagnitude > 0.5) {
          context.save();
          context.beginPath();
          const radiusValue = Math.min(
            (offsetMagnitude / 10) * (cellW / 2),
            Math.min(cellW, cellH) / 2,
          );
          if (typeof (context as any).roundRect === "function") {
            (context as any).roundRect(destX, destY, cellW, cellH, radiusValue);
          } else {
            context.rect(destX, destY, cellW, cellH);
          }
          context.clip();
          context.drawImage(
            img,
            srcX,
            srcY,
            cellW,
            cellH,
            destX,
            destY,
            cellW,
            cellH,
          );
          context.restore();
        } else {
          context.drawImage(
            img,
            srcX,
            srcY,
            cellW,
            cellH,
            destX,
            destY,
            cellW,
            cellH,
          );
        }
      }
    };
    gsap.ticker.add(renderEngine);

    const ctx = gsap.context(() => {
      gsap.set(modelWrapperRef.current, { y: "50vh" });
      gsap.set(".puzzle-piece", {
        x: () => gsap.utils.random(-300, 300),
        y: () => gsap.utils.random(-300, 300),
        scale: () => gsap.utils.random(1.2, 1.8),
        rotation: () => gsap.utils.random(-20, 20),
        opacity: 0,
      });
      gsap.set([".frame3-line", ".f4-text", ".frame5-line", ".frame6-line"], {
        y: "150%",
        opacity: 0,
      });

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinContainerRef.current,
          start: "top top",
          end: "+=9000",
          scrub: 1.5,
          pin: true,
        },
      });

      masterTl
        .to(
          logoTextRef.current,
          { scale: 0.12, ease: "none", duration: 1.5 },
          0,
        )
        .to(
          navbarRef.current,
          { opacity: 1, y: 0, ease: "power2.out", duration: 1.5 },
          0,
        )
        .to(
          frame2TextsRef.current,
          { y: "-40vh", ease: "power2.inOut", duration: 1.5 },
          0,
        )
        .to(
          ".puzzle-piece",
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 2.0,
            stagger: { amount: 0.5, from: "random" },
            ease: "power2.out",
          },
          1.5,
        )
        .fromTo(
          canvasRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power1.inOut" },
          3.0,
        )
        .set(".puzzle-wrapper", { opacity: 0 }, 3.5)
        .to(
          senTrixSequence,
          { frame: frameCount - 1, snap: "frame", duration: 11, ease: "none" },
          3.5,
        )
        .to(
          ".frame2-line",
          {
            y: "-120%",
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.inOut",
          },
          4.2,
        )
        .to(
          modelWrapperRef.current,
          { y: "0vh", duration: 1.5, ease: "power2.inOut" },
          4.5,
        )
        .to(
          ".frame3-line",
          {
            y: "0%",
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power2.out",
          },
          5.2,
        )
        .to(
          ".frame3-line",
          {
            y: "-120%",
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.inOut",
          },
          6.5,
        )
        .to(".f4-line1", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 7.0)
        .to(
          ".f4-text1",
          {
            y: "0%",
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          7.2,
        )
        .to(".f4-line2", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 7.6)
        .to(
          ".f4-text2",
          {
            y: "0%",
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          7.8,
        )
        .to(".f4-line3", { scaleX: 1, duration: 0.6, ease: "power2.out" }, 8.2)
        .to(
          ".f4-text3",
          {
            y: "0%",
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          8.4,
        )
        .to(
          ".f4-text",
          { y: "-120%", opacity: 0, duration: 0.5, ease: "power2.inOut" },
          9.2,
        )
        .to(".f4-line", { scaleX: 0, opacity: 0, duration: 0.4 }, 9.3)
        .to(
          modelWrapperRef.current,
          { y: "-50vh", duration: 1.5, ease: "power2.inOut" },
          9.5,
        )
        .to(
          ".frame5-line",
          {
            y: "0%",
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power2.out",
          },
          10.0,
        )
        .to(
          ".frame5-line",
          {
            y: "-120%",
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.inOut",
          },
          11.2,
        )
        .set(frame6TextsRef.current, { opacity: 1 }, 11.2)
        .to(
          ".frame6-line",
          {
            y: "0%",
            opacity: 1,
            duration: 1.0,
            stagger: 0.08,
            ease: "power2.out",
          },
          11.8,
        );

      gsap.set(".caps-heading-line", { y: "150%" });
      gsap.to(".caps-heading-line", {
        y: "0%",
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: capabilitiesSectionRef.current,
          start: "top 70%",
        },
      });

      gsap.to(".wf-center-laser", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: workflowSectionRef.current,
          start: "top center",
          end: "bottom 80%",
          scrub: true,
        },
      });

      gsap.utils.toArray(".workflow-node").forEach((node: any) => {
        const dot = node.querySelector(".wf-dot");
        const branch = node.querySelector(".wf-branch");
        const box = node.querySelector(".wf-box");
        const textTitle = node.querySelector(".wf-title");
        const textIndex = node.querySelector(".wf-index");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: node,
            start: "top 65%",
            toggleActions: "play reverse play reverse",
          },
        });
        tl.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" },
        )
          .fromTo(
            branch,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.2, ease: "power2.out" },
          )
          .fromTo(
            box,
            { opacity: 0, scaleY: 0, y: 10 },
            { opacity: 1, scaleY: 1, y: 0, duration: 0.4, ease: "power3.out" },
            "-=0.1",
          )
          .fromTo(
            textIndex,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
            "-=0.2",
          )
          .fromTo(
            textTitle,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            "-=0.2",
          );
      });
    });

    const hoverBoxEl = hoverBoxRef.current;
    let xTo = gsap.quickTo(hoverBoxEl, "x", {
        duration: 0.6,
        ease: "power4.out",
      }),
      yTo = gsap.quickTo(hoverBoxEl, "y", {
        duration: 0.6,
        ease: "power4.out",
      });

    const handleHoverListMouse = (e: MouseEvent) => {
      xTo(e.clientX + 20);
      yTo(e.clientY + 20);
    };
    const capsContainer = capabilitiesSectionRef.current;
    if (capsContainer) {
      capsContainer.addEventListener(
        "mousemove",
        handleHoverListMouse as EventListener,
      );
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobeMouseMove);
      if (capsContainer)
        capsContainer.removeEventListener(
          "mousemove",
          handleHoverListMouse as EventListener,
        );
      gsap.ticker.remove(renderEngine);
      ctx.revert();
    };
  }, [puzzlePieces]);

  const handleFooterMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!footerRef.current) return;
    const chars = footerRef.current.querySelectorAll(".footer-char");

    chars.forEach((char) => {
      const rect = char.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const MAX_RADIUS = 300;

      if (distance < MAX_RADIUS) {
        const pull = 1 - distance / MAX_RADIUS;
        gsap.to(char, {
          x: (e.clientX - centerX) * pull * 0.4,
          y: (e.clientY - centerY) * pull * 0.4,
          scaleY: 1 + pull * 0.4,
          scaleX: 1 + Math.abs((e.clientX - centerX) * 0.002) * pull,
          skewX: (e.clientX - centerX) * 0.05 * pull,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        gsap.to(char, {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
      }
    });
  };

  const handleFooterMouseLeave = () => {
    if (!footerRef.current) return;
    const chars = footerRef.current.querySelectorAll(".footer-char");
    gsap.to(chars, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
      overwrite: "auto",
    });
  };

  return (
    <div className="bg-[#0b0b0b] text-white overflow-x-hidden min-h-screen selection:bg-[#06b6d4]/30 selection:text-white">
      {/* 🛸 FROSTED GLASS HOVER TEXT BOX */}
      <div
        ref={hoverBoxRef}
        className="fixed top-0 left-0 w-[350px] p-6 z-[900] pointer-events-none opacity-0 scale-90 backdrop-blur-2xl bg-[#000000cc] border border-zinc-800 rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col justify-center gap-2 overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        <div ref={boxContentRef} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#f4f4f5]" />
            <h5
              ref={hoverTitleRef}
              className="font-['AeroRetina'] text-white text-base tracking-wide uppercase mt-[2px]"
            >
              {activeCap.title}
            </h5>
          </div>
          <p
            ref={hoverDescRef}
            className="font-['DM_Mono',monospace] text-[#a1a1aa] text-sm font-light leading-[1.6]"
          >
            {activeCap.desc}
          </p>
        </div>
      </div>

      <div className="fixed top-8 md:top-12 left-6 md:left-[4vw] z-[100] pointer-events-none mix-blend-difference">
        <h1
          ref={logoTextRef}
          className="text-[24vw] md:text-[24vw] whitespace-nowrap font-['AeroSemibold'] text-[#f4f4f5] uppercase tracking-[-0.04em] leading-[0.8] m-0 select-none origin-top-left"
        >
          SENT<span className="lowercase inline-block">ri</span>X
        </h1>
      </div>
      <div
        ref={navbarRef}
        className="fixed top-8 md:top-12 right-6 md:right-[4vw] z-[110] opacity-0 translate-y-[-10px] hidden md:flex gap-4 md:gap-8 items-center pt-2 pointer-events-auto"
      >
        <Link to="/login" className="font-['DM_Mono',monospace] text-xs md:text-sm tracking-widest text-[#f4f4f5] hover:text-[#a1a1aa] transition-colors border border-zinc-800 px-6 py-2 md:py-2.5 rounded-full bg-black hover:bg-zinc-900 uppercase hidden sm:block">
          Sign In
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="group relative flex items-center justify-between w-[100px] md:w-[130px] bg-black border border-zinc-800 rounded-full p-1 pl-4 md:pl-5 cursor-pointer hover:border-zinc-600 transition-colors"
        >
          <span className="font-['DM_Mono',monospace] text-xs md:text-sm text-[#f4f4f5] tracking-widest uppercase relative z-10 transition-opacity duration-300 w-8">
            {isMenuOpen ? "CLOSE" : "MENU"}
          </span>
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 group-hover:bg-[#f4f4f5] transition-colors duration-300 flex items-center justify-center flex-shrink-0">
            <div className="relative w-4 h-[10px]">
              <span
                className={`absolute left-0 w-full h-[1px] bg-white group-hover:bg-black transition-all duration-300 origin-center ${isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 w-full h-[1px] bg-white group-hover:bg-black transition-all duration-300 origin-center ${isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`}
              />
            </div>
          </div>
        </button>
      </div>

      {/* NAVBAR */}
      <div
        ref={navbarRef}
        className="fixed top-8 md:top-12 right-6 md:right-[4vw] z-[110] opacity-0 translate-y-[-10px] hidden md:flex gap-4 md:gap-8 items-center pt-2 pointer-events-auto"
      >
        <Link
          to="/login"
          className="font-['DM_Mono',monospace] text-xs md:text-sm tracking-widest text-[#f4f4f5] hover:text-[#a1a1aa] transition-colors border border-zinc-800 px-6 py-2 md:py-2.5 rounded-full bg-black hover:bg-zinc-900 uppercase hidden sm:block"
        >
          LOGIN
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="group relative flex items-center justify-between w-[100px] md:w-[130px] bg-black border border-zinc-800 rounded-full p-1 pl-4 md:pl-5 cursor-pointer hover:border-zinc-600 transition-colors"
        >
          <span className="font-['DM_Mono',monospace] text-xs md:text-sm text-[#f4f4f5] tracking-widest uppercase relative z-10 transition-opacity duration-300 w-8">
            {isMenuOpen ? "CLOSE" : "MENU"}
          </span>
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 group-hover:bg-[#f4f4f5] transition-colors duration-300 flex items-center justify-center flex-shrink-0">
            <div className="relative w-4 h-[10px]">
              <span
                className={`absolute left-0 w-full h-[1px] bg-white group-hover:bg-black transition-all duration-300 origin-center ${isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 w-full h-[1px] bg-white group-hover:bg-black transition-all duration-300 origin-center ${isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`}
              />
            </div>
          </div>
        </button>
      </div>

      <div
        ref={menuOverlayRef}
        className="fixed inset-0 w-full h-screen bg-[#0b0b0b] z-[100] translate-y-full flex flex-col justify-between pt-32 md:pt-40 pb-10 px-6 md:px-[6vw] overflow-hidden pointer-events-auto"
      >
        <div className="flex w-full flex-col md:flex-row justify-between items-start md:mt-10 gap-16 md:gap-0">
          <div className="flex flex-col gap-2 md:gap-4">
            {["Overview", "Capabilities", "Platform", "Contact"].map(
              (item, idx) => (
                <div key={idx} className="overflow-hidden">
                  <a
                    href="#"
                    className="menu-link-line inline-block text-[4rem] md:text-[6rem] font-['AeroRetina'] text-[#f4f4f5] tracking-tight translate-y-[120%] leading-none hover:opacity-50 transition-opacity"
                  >
                    {item}
                  </a>
                </div>
              ),
            )}
          </div>
          <div className="flex flex-col gap-8 text-[#a1a1aa] font-['DM_Mono',monospace] text-sm uppercase tracking-widest">
            <div className="flex flex-col gap-1">
              <div className="overflow-hidden">
                <span className="menu-link-line inline-block translate-y-[120%]">
                  SENTriX
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="menu-link-line inline-block translate-y-[120%]">
                  CYBER SECURITY HQ
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="menu-link-line inline-block translate-y-[120%]">
                  NEW YORK, USA
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="overflow-hidden">
                <a
                  href="#"
                  className="menu-link-line inline-block translate-y-[120%] hover:text-white"
                >
                  TWITTER
                </a>
              </div>
              <div className="overflow-hidden">
                <a
                  href="#"
                  className="menu-link-line inline-block translate-y-[120%] hover:text-white"
                >
                  LINKEDIN
                </a>
              </div>
              <div className="overflow-hidden">
                <a
                  href="#"
                  className="menu-link-line inline-block translate-y-[120%] hover:text-white"
                >
                  GITHUB
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={pinContainerRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-end bg-black z-0 pointer-events-none"
      >
        <div
          ref={modelWrapperRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <div className="puzzle-wrapper absolute inset-0 z-20 pointer-events-none">
            {puzzlePieces.map((clipStr, i) => (
              <div
                key={i}
                className="puzzle-piece absolute inset-0 w-full h-full mix-blend-screen opacity-100"
              >
                <img
                  src="/assets/sentrix/0001.webp"
                  alt="piece"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130vw] md:w-[70vw] h-auto max-w-none opacity-80"
                  style={{ clipPath: clipStr }}
                />
              </div>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130vw] md:w-[70vw] h-auto mix-blend-screen opacity-0 z-10 pointer-events-auto"
          />
        </div>

        <div
          ref={frame2TextsRef}
          className="absolute bottom-[6vh] left-0 w-full flex justify-between items-end px-6 md:px-[4vw] z-20 pointer-events-none"
        >
          <div className="flex flex-col gap-1">
            <div className="overflow-hidden leading-[1.05] pb-2">
              <h2 className="frame2-line inline-block text-[3.5rem] lg:text-[4.5rem] font-['AeroRetina'] tracking-tight m-0">
                Real-Time
              </h2>
            </div>
            <div className="overflow-hidden leading-[1.05] pb-2">
              <h2 className="frame2-line inline-block text-[3.5rem] lg:text-[4.5rem] font-['AeroRetina'] tracking-tight m-0">
                threat detection.
              </h2>
            </div>
          </div>
          <div className="hidden md:flex flex-col max-w-sm mb-2">
            <div className="overflow-hidden py-[1px]">
              <p className="frame2-line inline-block font-['DM_Mono',monospace] text-[#a1a1aa] leading-[1.65] font-light m-0">
                SENTriX unifies logs, ML detection,
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame2-line inline-block font-['DM_Mono',monospace] text-[#a1a1aa] leading-[1.65] font-light m-0">
                and attack correlation into one
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame2-line inline-block font-['DM_Mono',monospace] text-[#a1a1aa] leading-[1.65] font-light m-0">
                powerful SOC platform.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={frame3TextsRef}
          className="absolute top-[25vh] left-[4vw] z-20 pointer-events-none max-w-lg"
        >
          <div className="flex flex-col leading-[1.2]">
            <div className="overflow-hidden">
              <h2 className="frame3-line inline-block text-3xl md:text-[2.25rem] text-[#e4e4e7] font-['AeroRetina'] tracking-tight m-0 pb-1">
                In 24 hours, we
              </h2>
            </div>
            <div className="overflow-hidden hidden md:block">
              <h2 className="frame3-line inline-block text-3xl md:text-[2.25rem] text-[#e4e4e7] font-['AeroRetina'] tracking-tight m-0 pb-1">
                deploy a complete
              </h2>
            </div>
            <div className="overflow-hidden hidden md:block">
              <h2 className="frame3-line inline-block text-3xl md:text-[2.25rem] text-[#e4e4e7] font-['AeroRetina'] tracking-tight m-0 pb-1">
                enterprise SOC
              </h2>
            </div>
            <div className="overflow-hidden hidden md:block">
              <h2 className="frame3-line inline-block text-3xl md:text-[2.25rem] text-[#e4e4e7] font-['AeroRetina'] tracking-tight m-0 pb-1">
                that detects with
              </h2>
            </div>
            <div className="overflow-hidden hidden md:block">
              <h2 className="frame3-line inline-block text-3xl md:text-[2.25rem] text-[#e4e4e7] font-['AeroRetina'] tracking-tight m-0 pb-1">
                certainty.
              </h2>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] flex items-center gap-4">
            <div className="f4-line f4-line1 w-12 md:w-24 h-[1px] bg-zinc-600 origin-right scale-x-0 relative">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-[#f4f4f5] rounded-full" />
            </div>
            <div className="flex flex-col leading-[1.5]">
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text1 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  Enterprise-Grade
                </p>
              </div>
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text1 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  SOC in just 24
                </p>
              </div>
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text1 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  hours
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-[50%] left-[8%] flex items-center gap-4">
            <div className="flex flex-col items-end leading-[1.5]">
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text2 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  Stop threats
                </p>
              </div>
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text2 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  and earn
                </p>
              </div>
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text2 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  trust
                </p>
              </div>
            </div>
            <div className="f4-line f4-line2 w-12 md:w-24 h-[1px] bg-zinc-600 origin-left scale-x-0 relative">
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-[#f4f4f5] rounded-full" />
            </div>
          </div>
          <div className="absolute bottom-[25%] right-[12%] flex items-center gap-4">
            <div className="f4-line f4-line3 w-12 md:w-24 h-[1px] bg-zinc-600 origin-right scale-x-0 relative">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-[#f4f4f5] rounded-full" />
            </div>
            <div className="flex flex-col leading-[1.5]">
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text3 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  Respond faster &
                </p>
              </div>
              <div className="overflow-hidden py-[1px]">
                <p className="f4-text f4-text3 font-['DM_Mono',monospace] inline-block text-[#d4d4d8] text-sm tracking-wide m-0">
                  save capital
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={frame5TextsRef}
          className="absolute bottom-[8vh] md:bottom-[10vh] left-[4vw] z-20 pointer-events-none max-w-[90vw] md:max-w-5xl"
        >
          <div className="overflow-hidden pb-4">
            <h3 className="frame5-line inline-block text-5xl md:text-[4.5rem] font-['AeroRetina'] text-[#f4f4f5] tracking-tight mb-2 whitespace-nowrap">
              What is SENT<span className="lowercase inline-block">ri</span>X ?
            </h3>
          </div>
          <div className="flex flex-col leading-[1.8] mt-4 text-[16px] md:text-[20px] max-w-[800px] font-['DM_Mono',monospace] text-[#a1a1aa] font-light">
            <div className="overflow-hidden py-[1px]">
              <p className="frame5-line inline-block m-0">
                SENTriX is a unified security platform (SIEM). We centralize
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame5-line inline-block m-0">
                your logs, use AI to find hidden threats, and manage incident
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame5-line inline-block m-0">
                response while keeping customer data completely separated.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={frame6TextsRef}
          className="absolute bottom-[8vh] md:bottom-[10vh] left-[4vw] z-20 pointer-events-none max-w-[90vw] opacity-0 md:max-w-5xl"
        >
          <div className="overflow-hidden pb-4">
            <h3 className="frame6-line inline-block text-4xl md:text-[4rem] font-['AeroRetina'] text-[#f4f4f5] tracking-tight mb-2 whitespace-nowrap">
              Why Organizations Need It ?
            </h3>
          </div>
          <div className="flex flex-col leading-[1.8] mt-4 text-[16px] md:text-[20px] max-w-[880px] font-['DM_Mono',monospace] text-[#a1a1aa] font-light">
            <div className="overflow-hidden py-[1px]">
              <p className="frame6-line inline-block m-0">
                Modern systems generate millions of daily logs, making manual
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame6-line inline-block m-0">
                detection impossible and causing alert fatigue. SentriX
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame6-line inline-block m-0">
                automates log analysis, instantly maps scattered alerts into
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame6-line inline-block m-0">
                visual attack storylines, and slashes your mean time to
              </p>
            </div>
            <div className="overflow-hidden py-[1px]">
              <p className="frame6-line inline-block m-0">respond (MTTR).</p>
            </div>
          </div>
        </div>
      </div>

      <section
        ref={capabilitiesSectionRef}
        className="w-full relative z-20 bg-black pt-32 pb-40 px-6 md:px-[6vw] flex flex-col overflow-hidden"
        onMouseLeave={() => {
          gsap.to(hoverBoxRef.current, {
            scale: 0.8,
            opacity: 0,
            duration: 0.4,
          });
        }}
      >
        <div className="w-full flex flex-col mb-16 border-b border-zinc-800 pb-8">
          <div className="overflow-hidden leading-[1.2]">
            <h2 className="caps-heading-line font-['AeroRetina'] text-5xl md:text-[4rem] text-[#f4f4f5] inline-block tracking-tight m-0 pb-2">
              Core Security{" "}
            </h2>
          </div>
          <div className="overflow-hidden leading-[1.2]">
            <h2 className="caps-heading-line font-['AeroRetina'] text-5xl md:text-[4rem] text-[#f4f4f5] inline-block tracking-tight m-0 pb-2">
              Operations Capabilities
            </h2>
          </div>
        </div>
        <div className="w-full flex flex-col">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="group w-full flex flex-col cursor-pointer pb-2"
              onMouseEnter={() => {
                gsap.to(hoverBoxRef.current, {
                  scale: 1,
                  opacity: 1,
                  duration: 0.5,
                  ease: "back.out(1.7)",
                });
                if (
                  hoverTitleRef.current &&
                  hoverTitleRef.current.innerText !== cap.title.toUpperCase()
                ) {
                  gsap.to(boxContentRef.current, {
                    y: -15,
                    opacity: 0,
                    filter: "blur(4px)",
                    duration: 0.15,
                    ease: "power2.in",
                    onComplete: () => {
                      if (hoverTitleRef.current)
                        hoverTitleRef.current.innerText =
                          cap.title.toUpperCase();
                      if (hoverDescRef.current)
                        hoverDescRef.current.innerText = cap.desc;
                      gsap.fromTo(
                        boxContentRef.current,
                        { y: 15, opacity: 0, filter: "blur(4px)" },
                        {
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                          duration: 0.25,
                          ease: "power2.out",
                        },
                      );
                    },
                  });
                }
              }}
            >
              <div className="w-full pl-0 group-hover:pl-[6vw] lg:group-hover:pl-[12vw] group-hover:pr-[3vw] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col">
                <div className="w-full flex justify-between items-center py-6 text-zinc-500 group-hover:text-[#f4f4f5] transition-colors duration-500 relative z-10">
                  <h4 className="font-['DM_Mono',monospace] text-xl lg:text-[1.65rem] tracking-tight m-0">
                    {cap.title}
                  </h4>
                  <span className="font-['DM_Mono',monospace] text-sm lg:text-base font-light">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-zinc-800 group-hover:bg-[#f4f4f5] transition-colors duration-500 relative z-10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={workflowSectionRef}
        className="w-full relative z-20 bg-[#000] py-32 md:py-40 px-6 md:px-[6vw] overflow-hidden"
      >
        <div className="w-full flex flex-col items-center text-center mb-32 z-10 relative">
          <h2 className="font-['AeroRetina'] text-5xl md:text-[4.5rem] text-[#f4f4f5] tracking-tight m-0">
            The Architecture
          </h2>
        </div>
        <div className="relative max-w-5xl mx-auto w-full pb-20 mt-10">
          <div className="absolute top-0 bottom-0 left-[26px] md:left-1/2 w-[1px] bg-zinc-800 -translate-x-1/2 z-0" />
          <div className="wf-center-laser absolute top-0 bottom-0 left-[26px] md:left-1/2 w-[1px] bg-[#f4f4f5] shadow-[0_0_15px_#f4f4f5] -translate-x-1/2 origin-top scale-y-0 z-0" />
          <div className="flex flex-col w-full relative z-10 gap-0">
            {workflowSteps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`workflow-node relative w-full flex ${isEven ? "md:justify-start" : "md:justify-end"} justify-start pl-16 md:pl-0 h-[100px] items-center`}
                >
                  <div
                    className={`hidden md:block wf-branch absolute top-1/2 w-[5%] h-[1px] bg-white origin-${isEven ? "right" : "left"} scale-x-0 ${isEven ? "left-[45%]" : "right-[45%]"}`}
                  />
                  <div
                    className={`md:hidden wf-branch absolute top-1/2 left-[26px] w-[30px] h-[1px] bg-white origin-left scale-x-0`}
                  />
                  <div
                    className={`wf-dot absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white scale-0 left-[26px] md:left-1/2 -translate-x-1/2 z-10 shadow-[0_0_10px_#ffffff]`}
                  />
                  <div className="wf-box w-full md:w-[45%] flex items-center justify-between px-6 py-4 opacity-0 border-b border-zinc-900 origin-bottom transform-gpu overflow-hidden">
                    <h3 className="wf-title font-['AeroRetina'] text-[1.5rem] md:text-[2rem] text-[#f4f4f5] tracking-tight m-0 whitespace-nowrap">
                      {step}
                    </h3>
                    <span className="wf-index font-['DM_Mono',monospace] text-zinc-500 text-sm">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer
        ref={footerRef}
        onMouseMove={handleFooterMouseMove}
        onMouseLeave={handleFooterMouseLeave}
        className="w-full py-[15vh] bg-[#000] flex flex-col justify-center items-center relative overflow-hidden border-t border-zinc-900 group cursor-crosshair"
      >
        <h1 className="flex items-center text-[22vw] whitespace-nowrap font-['AeroSemibold'] text-[#f4f4f5] uppercase tracking-[-0.04em] leading-none m-0 select-none pointer-events-none">
          {["S", "E", "N", "T"].map((char, index) => (
            <span
              key={index}
              className="footer-char inline-block origin-center will-change-transform"
            >
              {char}
            </span>
          ))}
          <span className="footer-char inline-block origin-center lowercase mt-[1vw] will-change-transform">
            r
          </span>
          <span className="footer-char inline-block origin-center lowercase mt-[1vw] will-change-transform">
            i
          </span>
          <span className="footer-char inline-block origin-center will-change-transform">
            X
          </span>
        </h1>
      </footer>
    </div>
  );
}

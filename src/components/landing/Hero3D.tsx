import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Hero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Parallax mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden pt-8 pb-16 lg:py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Cinematic Headline & Big CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Top Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            CIVIC TECHNOLOGY • REAL-TIME DISPATCH
          </div>

          {/* Large Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            See a problem? <br />
            Help{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                Fix it.
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
            Report civic problems in seconds, calculate instant priority with our{' '}
            <strong className="text-white font-semibold">Smart Priority Engine</strong>, and track live repairs in real time with photographic proof.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* WOW 2: Floating/Glowing Main Attention Button */}
            <Link
              to="/report"
              className="group relative inline-flex items-center justify-center p-[2px] rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-rose-500/30"
            >
              {/* Gradient border & breathing outer pulse */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 rounded-2xl blur-sm opacity-80 group-hover:opacity-100 animate-pulse transition-opacity" />
              
              <div className="relative w-full px-8 py-4 bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 rounded-[14px] text-white flex items-center justify-center gap-3">
                <span className="text-xl animate-bounce">🚨</span>
                <span className="text-sm font-extrabold tracking-wider uppercase">
                  REPORT AN ISSUE
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Secondary Button */}
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-all hover:border-slate-600 gap-2 shadow-lg"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Issues</span>
            </Link>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Instant Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Verified Proof</span>
            </div>
          </div>
        </div>

        {/* Right Column: WOW 1 - 3D Civic Perspective Visualization with Floating Cards */}
        <div
          className="lg:col-span-6 relative perspective-1000 flex items-center justify-center min-h-[460px]"
          style={{
            perspective: '1200px',
          }}
        >
          {/* Isometric 3D Board Canvas */}
          <div
            className="relative w-full max-w-lg aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900 border border-slate-800/80 shadow-2xl p-6 transition-transform duration-300 ease-out flex flex-col justify-between overflow-hidden"
            style={{
              transform: `rotateX(${10 - mousePos.y * 15}deg) rotateY(${
                -12 + mousePos.x * 20
              }deg) translateZ(10px)`,
              boxShadow:
                '0 30px 60px -12px rgba(6, 182, 212, 0.15), 0 18px 36px -18px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Grid overlay for 3D environment feeling */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

            {/* Stylized Civic Map Layer */}
            <div className="relative z-0 w-full h-full flex flex-col justify-between py-2">
              {/* College Roads & Campus Paths */}
              <div className="relative w-full h-full">
                {/* Horizontal main avenue */}
                <div className="absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2 bg-slate-800/80 rounded-md border-y border-slate-700/60 flex items-center justify-around">
                  <div className="w-12 h-1 bg-amber-400/40 rounded-full" />
                  <div className="w-12 h-1 bg-amber-400/40 rounded-full" />
                  <div className="w-12 h-1 bg-amber-400/40 rounded-full" />
                </div>

                {/* Vertical Campus Boulevard */}
                <div className="absolute top-0 bottom-0 left-1/3 w-8 -translate-x-1/2 bg-slate-800/80 rounded-md border-x border-slate-700/60 flex flex-col items-center justify-around">
                  <div className="w-1 h-8 bg-amber-400/40 rounded-full" />
                  <div className="w-1 h-8 bg-amber-400/40 rounded-full" />
                </div>

                {/* Stylized Campus Buildings */}
                <div className="absolute top-4 right-8 w-24 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-2 shadow-lg flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Library Block</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-2 bg-cyan-500/30 rounded-sm" />
                    <div className="h-2 bg-cyan-500/30 rounded-sm" />
                    <div className="h-2 bg-cyan-500/30 rounded-sm" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-4 w-28 h-18 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-2 shadow-lg flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Main Gate Area</div>
                  <div className="flex gap-1 items-center text-[9px] text-cyan-400 font-mono">
                    <MapPin className="w-3 h-3" /> Zone A1
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING 3D ISSUE MARKER 1: 🔴 Pothole (Critical) */}
            <div
              className="absolute top-[42%] left-[34%] z-20 transition-transform duration-500"
              style={{
                transform: `translate3d(${mousePos.x * -15}px, ${
                  mousePos.y * -15
                }px, 40px)`,
              }}
            >
              <div className="relative group cursor-pointer">
                {/* Pulsing ring */}
                <div className="absolute -inset-2 bg-rose-500/40 rounded-2xl blur-md animate-ping" />
                <div className="relative backdrop-blur-md bg-slate-900/90 border border-rose-500/60 rounded-xl p-2.5 shadow-2xl shadow-rose-500/30 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base">
                    🕳️
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white">Pothole</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        91 Critical
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">College Main Gate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING 3D ISSUE MARKER 2: 🔵 Water Leak (High) */}
            <div
              className="absolute top-[18%] left-[62%] z-10 transition-transform duration-500"
              style={{
                transform: `translate3d(${mousePos.x * 20}px, ${
                  mousePos.y * 20
                }px, 30px)`,
              }}
            >
              <div className="backdrop-blur-md bg-slate-900/85 border border-sky-500/50 rounded-xl p-2 shadow-xl flex items-center gap-2">
                <span className="text-sm">💧</span>
                <div>
                  <span className="text-[11px] font-bold text-sky-300">Water Leak</span>
                  <p className="text-[9px] text-slate-400">Hostel Block 4</p>
                </div>
              </div>
            </div>

            {/* FLOATING 3D ISSUE MARKER 3: 🟡 Streetlight (Medium) */}
            <div
              className="absolute bottom-[24%] right-[8%] z-10 transition-transform duration-500"
              style={{
                transform: `translate3d(${mousePos.x * -10}px, ${
                  mousePos.y * -10
                }px, 25px)`,
              }}
            >
              <div className="backdrop-blur-md bg-slate-900/85 border border-amber-500/50 rounded-xl p-2 shadow-xl flex items-center gap-2">
                <span className="text-sm">💡</span>
                <div>
                  <span className="text-[11px] font-bold text-amber-300">Broken Streetlight</span>
                  <p className="text-[9px] text-slate-400">West Walkway</p>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING STAT CARD 1: +24 Resolved Today */}
          <div
            className="absolute -top-4 -right-2 sm:-right-4 z-30 transition-transform duration-300 hidden sm:block"
            style={{
              transform: `translate3d(${mousePos.x * 25}px, ${
                mousePos.y * 25
              }px, 50px)`,
            }}
          >
            <div className="backdrop-blur-xl bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl shadow-emerald-500/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">+24 Today</div>
                <div className="text-[10px] text-emerald-400 font-medium">Issues Resolved</div>
              </div>
            </div>
          </div>

          {/* FLOATING STAT CARD 2: 18 min Avg Response */}
          <div
            className="absolute -bottom-6 -left-2 sm:-left-4 z-30 transition-transform duration-300 hidden sm:block"
            style={{
              transform: `translate3d(${mousePos.x * -20}px, ${
                mousePos.y * -20
              }px, 45px)`,
            }}
          >
            <div className="backdrop-blur-xl bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl shadow-cyan-500/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white">18 min</div>
                <div className="text-[10px] text-cyan-400 font-medium">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

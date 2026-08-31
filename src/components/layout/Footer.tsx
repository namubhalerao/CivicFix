import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Sparkles, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/80 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
            CF
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              CivicFix
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                System Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time Civic Issue Management & Smart Priority Dispatch
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
          <Link to="/" className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link to="/explore" className="hover:text-cyan-400 transition-colors">
            Public Feed
          </Link>
          <Link to="/track" className="hover:text-cyan-400 transition-colors">
            Track Issue
          </Link>
          <Link to="/impact" className="hover:text-cyan-400 transition-colors">
            Live Impact
          </Link>
          <Link to="/admin/login" className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-semibold">
            <Shield className="w-3 h-3" />
            Admin Portal
          </Link>
        </div>

        {/* Hackathon Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>College Hackathon Edition</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-cyan-400">v2.4.0</span>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Award, CheckCircle2, FileText, Heart, Shield, Sparkles, User, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const activities = [
    { title: 'Report Verified (+50 pts)', desc: 'Pothole at College Main Gate verified by triage team', time: '2 hours ago' },
    { title: 'Resolution Feedback Given (+25 pts)', desc: 'Rated 5-stars on Streetlight restoration', time: '1 day ago' },
    { title: 'Report Resolved (+100 pts)', desc: 'Water leakage at Library Quad sealed', time: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-xl shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl font-extrabold text-white">
              {user?.name?.slice(0, 2).toUpperCase() || 'RS'}
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.name || 'Rahul Sharma'}</h1>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase">
                🥇 Civic Hero
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user?.email || 'rahul.sharma@example.com'}</p>
            <p className="text-xs text-slate-300">
              Active civic contributor helping keep campus and municipal roads safe since 2026.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center shrink-0 min-w-[140px]">
            <div className="text-2xl font-extrabold font-mono text-cyan-400">
              {user?.points || 820}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              Civic Points
            </div>
          </div>
        </div>

        {/* 2-Column: Tier Badges & Points Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Civic Badges & Milestones</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <div className="text-xs font-bold text-white">Campus Sentinel</div>
                  <div className="text-[10px] text-slate-400">Submitted 5+ verified emergency tickets</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="text-xs font-bold text-white">Speedy Reporter</div>
                  <div className="text-[10px] text-slate-400">First to flag a critical infrastructure hazard</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="text-xs font-bold text-white">Accountability Star</div>
                  <div className="text-[10px] text-slate-400">Provided feedback on 3+ completed repairs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Recent Points Earned</span>
            </h2>

            <div className="space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-cyan-400">{act.title}</div>
                  <p className="text-[11px] text-slate-300">{act.desc}</p>
                  <div className="text-[9px] text-slate-500 font-mono">{act.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

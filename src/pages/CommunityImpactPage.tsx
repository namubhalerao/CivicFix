import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { ImpactStats } from '../components/landing/ImpactStats';

export const CommunityImpactPage: React.FC = () => {
  const leaderboard = [
    { rank: 1, name: 'Rahul Sharma', points: 820, resolved: 8, badge: '🥇 Civic Hero' },
    { rank: 2, name: 'Priya Patel', points: 640, resolved: 6, badge: '🥈 Guardian' },
    { rank: 3, name: 'Namrata Patil', points: 510, resolved: 5, badge: '🥉 Pioneer' },
    { rank: 4, name: 'Aditya Deshmukh', points: 390, resolved: 4, badge: '⭐ Sentinel' },
    { rank: 5, name: 'Sneha Kulkarni', points: 280, resolved: 3, badge: '🛡️ Advocate' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Civic Transparency Index
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Small Reports. <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Big Impact.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real-time telemetry showing how citizen action accelerates municipal repair velocity and creates safer public spaces.
          </p>
        </div>

        {/* Cinematic Counters */}
        <ImpactStats />

        {/* 2-Column Section: Impact Pillars & Top Community Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Community Achievements */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span>Our Real-World Transformation</span>
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      78% Faster Triage Dispatch
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Smart priority algorithm eliminates manual sorting delays, dispatching critical road and electrical hazards within 18 minutes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      100% Photographic Verification
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Every completed work order requires Before/After photographic evidence uploaded by municipal crew before ticket closure.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Transparent Citizen Accountability
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Citizens rate municipal fixes from 1 to 5 stars, directly impacting departmental performance metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Civic Leaderboard
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Live Top 5</span>
              </div>

              <div className="space-y-3">
                {leaderboard.map((item) => (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      item.rank === 1
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                          item.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{item.rank}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.resolved} fixes verified
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold font-mono text-cyan-400">
                        {item.points} pts
                      </div>
                      <div className="text-[9px] font-bold text-purple-300">{item.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

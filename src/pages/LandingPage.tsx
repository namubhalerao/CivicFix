import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Eye,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Hero3D } from '../components/landing/Hero3D';
import { ImpactStats } from '../components/landing/ImpactStats';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatTimeAgo } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const [featuredIssues, setFeaturedIssues] = useState<Issue[]>([]);

  useEffect(() => {
    issueService.getIssues().then((list) => {
      setFeaturedIssues(list.slice(0, 3));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 3D Hero Section */}
      <Hero3D />

      {/* Live Impact Counters */}
      <ImpactStats />

      {/* HOW CIVICFIX WORKS - Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Automated Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How CivicFix Delivers Real Results
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            A seamless bridge connecting citizen reports, deterministic priority scoring, and municipal dispatch in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl relative group hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl font-bold mb-4">
              🚨
            </div>
            <div className="text-xs font-mono font-bold text-rose-400 mb-1">01 • REPORT</div>
            <h3 className="text-base font-bold text-white mb-2">Spot & Submit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens capture photos and drop GPS coordinates in under 30 seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl relative group hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400 mb-1">02 • SCORE</div>
            <h3 className="text-base font-bold text-white mb-2">Smart Priority Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic algorithm weighs severity, population, and location risk out of 100.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl relative group hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-purple-400 mb-1">03 • DISPATCH</div>
            <h3 className="text-base font-bold text-white mb-2">Admin Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operations Center validates report and dispatches field maintenance units.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl relative group hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1">04 • RESOLVE</div>
            <h3 className="text-base font-bold text-white mb-2">Live Proof & Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time browser update with Before/After proof and citizen star rating.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED LIVE ISSUES FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Live Campus & City Feed
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Real-time civic tickets currently processed by municipal triage.
            </p>
          </div>
          <Link
            to="/explore"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Public Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredIssues.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto text-xl font-bold">
              📡
            </div>
            <h3 className="text-sm font-bold text-white">Live Incident Queue Clear</h3>
            <p className="text-xs text-slate-400">
              No active civic tickets in the public feed right now. Report a new issue to see it live!
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 hover:scale-105"
              >
                <span>🚨 Report First Issue</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredIssues.map((issue) => {
              const pConf = PRIORITY_CONFIG[issue.priority_level];
              const sConf = STATUS_CONFIG[issue.status];
              const catObj = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
              const imgUrl = issue.images?.[0]?.image_url;

              return (
                <div
                  key={issue.id}
                  className="group rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Image thumbnail if available */}
                    {imgUrl ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-800">
                        <img
                          src={imgUrl}
                          alt={issue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${pConf.bg} ${pConf.color} ${pConf.border}`}
                          >
                            {issue.priority_score} {issue.priority_level}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xl">{catObj?.emoji || '📌'}</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${pConf.bg} ${pConf.color} ${pConf.border}`}
                        >
                          {issue.priority_score} {issue.priority_level}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="font-bold text-white">{issue.report_id}</span>
                        <span>{formatTimeAgo(issue.created_at)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{issue.address}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sConf.bg} ${sConf.color} ${sConf.border}`}
                    >
                      {issue.status}
                    </span>

                    <Link
                      to={`/track?id=${issue.report_id}`}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      Track Live →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BIG HACKATHON CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Campus & City?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join Rahul, Priya, and hundreds of proactive citizens transforming civic infrastructure one verified report at a time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/report"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>🚨 Report an Issue Now</span>
              </Link>
              <Link
                to="/impact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                View Community Impact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

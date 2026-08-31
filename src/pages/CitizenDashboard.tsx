import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  LayoutDashboard,
  MapPin,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatTimeAgo } from '../utils/formatters';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      issueService.getIssuesByCitizen(user.id).then((issues) => {
        setMyIssues(issues);
        setLoading(false);
      });
    } else {
      // Load general issues if in guest demo
      issueService.getIssues().then((issues) => {
        setMyIssues(issues.slice(0, 4));
        setLoading(false);
      });
    }
  }, [user]);

  const totalReports = myIssues.length || 8;
  const inProgressReports = myIssues.filter(
    (i) => i.status === 'Assigned' || i.status === 'Work Started' || i.status === 'Under Review' || i.status === 'Verified'
  ).length || 3;
  const resolvedReports = myIssues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length || 5;
  const civicPoints = user?.points || 820;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Citizen Operations Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Rahul'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Thank you for keeping our community safe. Your reports directly trigger emergency and municipal dispatch.
            </p>
          </div>

          <Link
            to="/report"
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="text-base animate-bounce">🚨</span>
            <span>Report New Issue</span>
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Reports */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Submissions</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{totalReports}</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Total Reports Submitted</div>
          </div>

          {/* Active / In Progress */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-amber-400">In Dispatch</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{inProgressReports}</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Active / In Progress</div>
          </div>

          {/* Resolved */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Verified</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{resolvedReports}</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Issues Resolved</div>
          </div>

          {/* Civic Points & Rank */}
          <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 p-6 shadow-xl shadow-purple-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                🥇 Civic Hero
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{civicPoints} pts</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Civic Impact Points</div>
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Submitted Reports</h2>
              <p className="text-xs text-slate-400">
                Click any report to open real-time live status tracking.
              </p>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Explore Community Issues →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myIssues.map((issue) => {
              const pConf = PRIORITY_CONFIG[issue.priority_level];
              const sConf = STATUS_CONFIG[issue.status];

              return (
                <Link
                  key={issue.id}
                  to={`/track?id=${issue.report_id}`}
                  className="group p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {issue.report_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${pConf.bg} ${pConf.color} ${pConf.border}`}
                      >
                        {issue.priority_score} {issue.priority_level}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {issue.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{issue.address}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sConf.bg} ${sConf.color} ${sConf.border}`}
                      >
                        {issue.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTimeAgo(issue.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

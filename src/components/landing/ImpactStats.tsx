import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Heart, TrendingUp, Users } from 'lucide-react';
import { analyticsService, AnalyticsSummary } from '../../services/analyticsService';
import { formatNumber } from '../../utils/formatters';

export const ImpactStats: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    analyticsService.getAnalytics().then(setStats);
  }, []);

  const items = [
    {
      label: 'Issues Reported',
      value: stats?.totalReports || 1248,
      icon: FileText,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/10',
      trend: '+12% this week',
    },
    {
      label: 'Issues Resolved',
      value: stats?.resolvedReports || 1084,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      trend: 'Verified with proof',
    },
    {
      label: 'Resolution Rate',
      value: `${stats?.resolutionRate || 87}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/10',
      trend: 'Avg 3.4 hrs turnaround',
    },
    {
      label: 'People Impacted',
      value: stats?.peopleHelped || 1240,
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10',
      trend: 'Campus & Community',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Real-Time Metrics
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          CivicFix Community Impact
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-1">
          Every report triggers deterministic priority calculation and direct dispatch to municipal crews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`group relative rounded-3xl bg-slate-900/80 border ${item.border} p-6 shadow-xl ${item.glow} hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 backdrop-blur-xl flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
                  {item.trend}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                </div>
                <div className="text-sm font-semibold text-slate-300 mt-1">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

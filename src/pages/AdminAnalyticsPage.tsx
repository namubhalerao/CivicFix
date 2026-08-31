import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  PieChart as PieIcon,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';
import { AdminNavTabs } from '../components/admin/AdminNavTabs';

export const AdminAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAnalytics().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  const categoryColors: Record<string, string> = {
    Pothole: '#f43f5e',
    'Street Light': '#06b6d4',
    Garbage: '#10b981',
    'Water Leak': '#3b82f6',
    Traffic: '#f59e0b',
    Tree: '#84cc16',
    Electrical: '#ef4444',
  };

  const priorityColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const priorityData = summary
    ? summary.priorityDistribution.map((p) => ({
        name: p.name,
        value: p.count,
        color: p.color,
      }))
    : [];

  const statusData = summary
    ? Object.entries(summary.statusDistribution).map(([status, count]) => ({
        status,
        count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Telemetry & Performance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Civic Analytics Engine
            </h1>
            <p className="text-xs text-slate-400">
              Departmental response velocity, priority allocation, and resolution efficiency.
            </p>
          </div>

          <AdminNavTabs />
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg. Triage Response
            </div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400">18 mins</div>
            <p className="text-[11px] text-slate-400">From citizen submit to verified status</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg. Fix Velocity
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">4.2 hours</div>
            <p className="text-[11px] text-slate-400">Critical hazard repair turnaround</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citizen Satisfaction
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">4.8 / 5.0 ⭐</div>
            <p className="text-[11px] text-slate-400">Based on verified post-repair ratings</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Photo Proof Compliance
            </div>
            <div className="text-3xl font-extrabold font-mono text-purple-400">100%</div>
            <p className="text-[11px] text-slate-400">Mandatory Before/After verification</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Category Breakdown (Bar Chart) */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Issues by Hazard Category
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Total Volume</span>
            </div>

            <div className="h-72 w-full">
              {summary && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {summary.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || '#06b6d4'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Priority Distribution (Pie Chart) */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-rose-400" />
                Smart Priority Allocation
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Score Tiers</span>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={priorityColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

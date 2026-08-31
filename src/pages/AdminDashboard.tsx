import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileSpreadsheet,
  Layers,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { LiveFeed } from '../components/admin/LiveFeed';
import { IssueTable } from '../components/admin/IssueTable';
import { IssueDetailModal } from '../components/admin/IssueDetailModal';
import { AdminNavTabs } from '../components/admin/AdminNavTabs';
import { realtimeBus } from '../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const fetchIssues = async () => {
    setIsRefreshing(true);
    try {
      const data = await issueService.getIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load admin issues:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    // Subscribe to new or updated issues via RealtimeBus
    const unsub = realtimeBus.subscribe<Issue>('issues_channel', (updatedIssue) => {
      setIssues((prev) => {
        const index = prev.findIndex((i) => i.id === updatedIssue.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedIssue;
          return updated;
        } else {
          return [updatedIssue, ...prev];
        }
      });
    });

    return () => {
      unsub();
    };
  }, []);

  const handleOpenIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleIssueUpdated = (updated: Issue) => {
    setSelectedIssue(updated);
    setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handlePurgeOldIssues = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to completely remove all old demo issue reports? The database will start with 0 issues.'
    );
    if (!confirmDelete) return;

    setIsPurging(true);
    try {
      await issueService.deleteAllOldDemoIssues();
      await fetchIssues();
    } catch (err) {
      console.error('Error purging demo issues:', err);
    } finally {
      setIsPurging(false);
    }
  };

  // Quick stats
  const totalCount = issues.length;
  const criticalCount = issues.filter((i) => i.priority_level === 'critical').length;
  const inProgressCount = issues.filter(
    (i) => i.status === 'Assigned' || i.status === 'Work Started' || i.status === 'Under Review' || i.status === 'Verified'
  ).length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Command Center Header */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-extrabold">
                Emergency Triage Command
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              CivicFix Operations Console
            </h1>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-slate-200">Sanjana Dhere (Admin)</strong> • High-Priority Incident Management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminNavTabs />
            <button
              onClick={handlePurgeOldIssues}
              disabled={isPurging}
              title="Delete all old demo/test issues"
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/30 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging ? 'Purging...' : 'Purge Old Demo Data'}</span>
            </button>
            <button
              onClick={fetchIssues}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* 4 Command Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </span>
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-white">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Across all municipal sectors</div>
          </div>

          {/* Critical */}
          <div className="rounded-3xl bg-slate-900/80 border border-rose-500/30 p-6 shadow-xl shadow-rose-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Critical Hazards
              </span>
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-rose-400">{criticalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Immediate dispatch required</div>
          </div>

          {/* Active / In Progress */}
          <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 shadow-xl shadow-amber-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                In Dispatch / Works
              </span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-400">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Crew actively deployed</div>
          </div>

          {/* Resolved */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 shadow-xl shadow-emerald-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Resolved With Proof
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-emerald-400">{resolvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">100% photo verified</div>
          </div>
        </div>

        {/* 2-Column Section: Full Data Table + Live Feed Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Table */}
          <div className="lg:col-span-8 space-y-6">
            <IssueTable
              issues={issues}
              onSelectIssue={handleOpenIssue}
              onIssueUpdated={handleIssueUpdated}
            />
          </div>

          {/* Live Dispatch Stream Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <LiveFeed issues={issues} onSelectIssue={handleOpenIssue} />
          </div>
        </div>

        {/* Admin Issue Detail and Status Change Modal */}
        <IssueDetailModal
          issue={selectedIssue}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onIssueUpdated={handleIssueUpdated}
        />
      </div>
    </div>
  );
};

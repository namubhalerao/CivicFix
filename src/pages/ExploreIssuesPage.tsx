import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Issue, IssueCategory, IssueStatus } from '../types';
import { issueService } from '../services/issueService';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatTimeAgo } from '../utils/formatters';

export const ExploreIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    issueService.getIssues().then((list) => {
      setIssues(list);
      setLoading(false);
    });
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        !searchTerm.trim() ||
        issue.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || issue.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || issue.priority_level === priorityFilter;
      const matchCategory = categoryFilter === 'All' || issue.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [issues, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Public Civic Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Explore Community Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Browse all public civic reports across campus and municipal sectors.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports, streets, landmarks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter issues by status"
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Assigned">Assigned</option>
                <option value="Work Started">Work Started</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter issues by priority"
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter issues by category"
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issue Cards Grid */}
        {filteredIssues.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Civic Issues Found</h3>
              <p className="text-xs text-slate-400">
                {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'
                  ? 'No reports matched your active filter criteria. Try resetting filters.'
                  : 'No civic reports currently in the system. Be the first to report an issue!'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 hover:scale-105"
              >
                <span>🚨 Report New Civic Issue</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
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
                    {imgUrl ? (
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-800">
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
                        <span className="text-2xl">{catObj?.emoji || '📌'}</span>
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
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{issue.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Users className="w-3 h-3 text-amber-400" />
                        <span>{issue.people_affected}+</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sConf.bg} ${sConf.color} ${sConf.border}`}
                    >
                      {issue.status}
                    </span>

                    <Link
                      to={`/track?id=${issue.report_id}`}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      Track Issue →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

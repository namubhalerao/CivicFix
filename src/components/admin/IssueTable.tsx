import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  HardHat,
  MapPin,
  Search,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import { Issue, IssueCategory, IssueStatus, PriorityLevel } from '../../types';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import { issueService } from '../../services/issueService';

interface Props {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onIssueUpdated?: (issue: Issue) => void;
}

export const IssueTable: React.FC<Props> = ({ issues, onSelectIssue, onIssueUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Filtered and searched data
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        !searchTerm.trim() ||
        issue.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.assigned_team_name && issue.assigned_team_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (issue.landmark && issue.landmark.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All' || issue.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || issue.priority_level === priorityFilter;
      const matchCategory = categoryFilter === 'All' || issue.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [issues, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIssues.slice(start, start + itemsPerPage);
  }, [filteredIssues, currentPage]);

  const handleQuickStatusChange = async (issue: Issue, newStatus: IssueStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (newStatus === issue.status) return;

    setUpdatingId(issue.id);
    try {
      const updated = await issueService.updateStatus({
        issueId: issue.id,
        newStatus,
        note: `Status updated to ${newStatus} via Quick Console Dispatch.`,
        adminName: 'Sanjana Dhere (Admin)',
      });
      if (onIssueUpdated) {
        onIssueUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to quick update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Report ID, title, landmark, team..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter issues by status"
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="Work Started">Work Started</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
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

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
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

      {/* Main Table with Assigned Team & Work Progress Column */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Report ID</th>
              <th className="py-3.5 px-4">Issue / Title</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Assigned Team</th>
              <th className="py-3.5 px-4">Work Progress (Live Status)</th>
              <th className="py-3.5 px-4">Reported</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {paginatedIssues.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No civic issues match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedIssues.map((issue) => {
                const pConf = PRIORITY_CONFIG[issue.priority_level];
                const sConf = STATUS_CONFIG[issue.status];
                const categoryObj = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
                const isUpdating = updatingId === issue.id;

                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectIssue(issue)}
                  >
                    {/* Report ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {issue.report_id}
                    </td>

                    {/* Title & Category */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                        <span>{categoryObj?.emoji}</span>
                        <span>{categoryObj?.label || issue.category}</span>
                      </div>
                      <div className="font-semibold text-slate-100 truncate mt-0.5">
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{issue.address}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${pConf.bg} ${pConf.color} ${pConf.border}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {issue.priority_score} {issue.priority_level}
                      </span>
                    </td>

                    {/* Assigned Team */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {issue.assigned_team_name ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[11px]">
                            <HardHat className="w-3 h-3 text-cyan-400" />
                            {issue.assigned_team_name}
                          </span>
                          {issue.assigned_team_leader && (
                            <div className="text-[10px] text-slate-400 pl-1">
                              Lead: {issue.assigned_team_leader}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Work Progress (Quick Status Select) */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <select
                          value={issue.status}
                          disabled={isUpdating}
                          onChange={(e) => handleQuickStatusChange(issue, e.target.value as IssueStatus, e)}
                          aria-label={`Change status for ${issue.report_id}`}
                          className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer outline-none ${sConf.bg} ${sConf.color} ${sConf.border} focus:ring-2 focus:ring-cyan-500`}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Verified">Verified</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Work Started">Work Started</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {isUpdating && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                      </div>
                    </td>

                    {/* Reported */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatTimeAgo(issue.created_at)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(issue);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Dispatch
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <div>
          Showing{' '}
          <strong className="text-slate-200">
            {filteredIssues.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-slate-200">
            {Math.min(currentPage * itemsPerPage, filteredIssues.length)}
          </strong>{' '}
          of <strong className="text-slate-200">{filteredIssues.length}</strong> reports
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

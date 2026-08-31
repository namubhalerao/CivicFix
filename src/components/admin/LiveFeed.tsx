import React from 'react';
import { AlertCircle, Clock, MapPin, Sparkles } from 'lucide-react';
import { Issue } from '../../types';
import { PRIORITY_CONFIG } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/formatters';

interface Props {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const LiveFeed: React.FC<Props> = ({ issues, onSelectIssue }) => {
  // Sort by newest first
  const latestIssues = [...issues].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Live Dispatch Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">Incoming Feed</span>
      </div>

      <div className="space-y-3">
        {latestIssues.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <p className="text-xs text-slate-400 font-medium">All queues clear</p>
            <p className="text-[10px] text-slate-500">No active incoming incidents at this moment</p>
          </div>
        ) : (
          latestIssues.map((issue) => {
            const priorityConf = PRIORITY_CONFIG[issue.priority_level];
            const isCritical = issue.priority_level === 'critical';

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                  isCritical
                    ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60 shadow-sm shadow-rose-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-white">
                      {issue.report_id}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${priorityConf.bg} ${priorityConf.color} ${priorityConf.border}`}
                    >
                      {issue.priority_score} {issue.priority_level}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {issue.title}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{issue.address}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(issue.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, Clock, Flame, HardHat, Phone, ShieldAlert, Sparkles, UserCheck, Wrench } from 'lucide-react';
import { Issue, IssueStatus, IssueStatusHistory } from '../../types';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

interface Props {
  issue: Issue;
}

const PRIMARY_STEPS: IssueStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'Work Started',
  'Resolved',
];

export const TimelineJourney: React.FC<Props> = ({ issue }) => {
  const currentStatus = issue.status;
  const currentStepIndex = PRIMARY_STEPS.indexOf(currentStatus);
  const isSpecialStatus = currentStatus === 'Rejected' || currentStatus === 'Duplicate' || currentStatus === 'Closed';

  // Map history records by new_status
  const historyMap = new Map<string, IssueStatusHistory>();
  (issue.status_history || []).forEach((h) => {
    historyMap.set(h.new_status, h);
  });

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Live Resolution Journey
          </h3>
          <p className="text-xs text-slate-400">
            Real-time synchronization with municipal dispatch log
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
            Live Stream Connected
          </span>
        </div>
      </div>

      {/* Assigned Municipal Team Card (if assigned) */}
      {issue.assigned_team_name && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <HardHat className="w-4 h-4 text-cyan-400" />
              <span>Assigned Field Crew</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
              Active Assignment
            </span>
          </div>

          <div className="text-sm font-extrabold text-white">
            {issue.assigned_team_name}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs border-t border-cyan-500/20 text-slate-300">
            {issue.assigned_team_leader && (
              <div>
                <span className="text-slate-400 text-[11px] block">Team Leader</span>
                <span className="font-semibold text-white">{issue.assigned_team_leader}</span>
              </div>
            )}
            {issue.assigned_team_phone && (
              <div>
                <span className="text-slate-400 text-[11px] block">Crew Contact</span>
                <a
                  href={`tel:${issue.assigned_team_phone}`}
                  className="font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  +91 {issue.assigned_team_phone}
                </a>
              </div>
            )}
          </div>

          {issue.assigned_at && (
            <div className="text-[10px] text-slate-400 pt-1">
              Dispatched: {formatDate(issue.assigned_at)} ({formatTimeAgo(issue.assigned_at)})
            </div>
          )}
        </div>
      )}

      {/* Vertical Steps */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {PRIMARY_STEPS.map((stepName, idx) => {
          const stepConfig = STATUS_CONFIG[stepName];
          const isCompleted = currentStepIndex > idx || currentStatus === 'Resolved' || currentStatus === 'Closed';
          const isCurrent = currentStatus === stepName;
          const historyEntry = historyMap.get(stepName);

          return (
            <div key={stepName} className="relative flex items-start gap-4 group">
              {/* Step Circle Marker */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-cyan-500 text-slate-950 ring-8 ring-cyan-500/30 shadow-xl shadow-cyan-500/50 scale-110'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold tracking-tight ${
                      isCurrent
                        ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                        : isCompleted
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepConfig.label}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Current Status
                      </span>
                    )}
                  </span>

                  {historyEntry && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(historyEntry.created_at)}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isCurrent ? 'text-slate-200' : isCompleted ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {historyEntry?.note || stepConfig.description}
                </p>

                {historyEntry?.changed_by_name && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>Updated by {historyEntry.changed_by_name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Special Status banner if Rejected or Duplicate */}
        {isSpecialStatus && currentStatus !== 'Closed' && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <span className="font-bold uppercase tracking-wider block mb-1">
              Issue Status: {currentStatus}
            </span>
            <p className="text-slate-300">
              {issue.status_history?.[issue.status_history.length - 1]?.note ||
                'This ticket was marked as non-actionable by dispatch.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

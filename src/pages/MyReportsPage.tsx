import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatTimeAgo } from '../utils/formatters';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      issueService.getIssuesByCitizen(user.id).then((list) => {
        setIssues(list);
        setLoading(false);
      });
    } else {
      issueService.getIssues().then((list) => {
        setIssues(list);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Submitted Reports</h1>
            <p className="text-xs text-slate-400 mt-1">
              Track the dispatch and resolution progress of all issues you submitted.
            </p>
          </div>

          <Link
            to="/report"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/25 hover:scale-105 transition-all"
          >
            <span>🚨 Report New Issue</span>
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading your reports...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Reports Submitted Yet</h3>
              <p className="text-xs text-slate-400">
                You haven't reported any civic issues yet. Spot a pothole, broken streetlight, or garbage pile? Report it now!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 hover:scale-105"
              >
                <span>🚨 Report Your First Civic Issue</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => {
              const pConf = PRIORITY_CONFIG[issue.priority_level];
              const sConf = STATUS_CONFIG[issue.status];

              return (
                <Link
                  key={issue.id}
                  to={`/track?id=${issue.report_id}`}
                  className="group p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                        {issue.report_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${pConf.bg} ${pConf.color} ${pConf.border}`}
                      >
                        {issue.priority_score} {issue.priority_level}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sConf.bg} ${sConf.color} ${sConf.border}`}
                    >
                      {issue.status}
                    </span>

                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                      Track Live <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

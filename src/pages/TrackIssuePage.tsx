import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  MessageSquare,
  Radio,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import { TimelineJourney } from '../components/tracking/TimelineJourney';
import { BeforeAfterSlider } from '../components/tracking/BeforeAfterSlider';
import { FeedbackModal } from '../components/feedback/FeedbackModal';
import { realtimeBus } from '../lib/supabase';

export const TrackIssuePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportIdQuery = searchParams.get('id') || '';

  const [inputReportId, setInputReportId] = useState(reportIdQuery || '');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [liveUpdateAlert, setLiveUpdateAlert] = useState<string | null>(null);

  const fetchIssue = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const match = await issueService.getIssueByReportIdOrId(idToSearch);
      if (match) {
        setIssue(match);
      } else {
        setIssue(null);
        setErrorMsg(`No civic ticket found with Report ID: "${idToSearch}". Please check the ID.`);
      }
    } catch (err) {
      setErrorMsg('Failed to query civic issue database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportIdQuery) {
      fetchIssue(reportIdQuery);
      setInputReportId(reportIdQuery);
    } else {
      setIssue(null);
    }
  }, [reportIdQuery]);

  // REALTIME SYNCHRONIZATION: Subscribe to live updates for this issue!
  useEffect(() => {
    if (!issue) return;

    const unsubId = realtimeBus.subscribe<Issue>(`issue_${issue.id}`, (updated) => {
      setIssue(updated);
      setLiveUpdateAlert(`Status transitioned to ${updated.status}!`);
      setTimeout(() => setLiveUpdateAlert(null), 6000);
    });

    const unsubReportId = realtimeBus.subscribe<Issue>(`issue_${issue.report_id}`, (updated) => {
      setIssue(updated);
      setLiveUpdateAlert(`Status transitioned to ${updated.status}!`);
      setTimeout(() => setLiveUpdateAlert(null), 6000);
    });

    return () => {
      unsubId();
      unsubReportId();
    };
  }, [issue?.id, issue?.report_id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReportId.trim()) return;
    setSearchParams({ id: inputReportId.trim() });
    fetchIssue(inputReportId.trim());
  };

  const pConf = issue ? PRIORITY_CONFIG[issue.priority_level] : null;
  const sConf = issue ? STATUS_CONFIG[issue.status] : null;
  const catObj = issue ? ISSUE_CATEGORIES.find((c) => c.id === issue.category) : null;

  // Images
  const reportImage = issue?.images?.find((img) => img.image_type === 'REPORT')?.image_url;
  const beforeImage = issue?.images?.find((img) => img.image_type === 'BEFORE')?.image_url || reportImage;
  const afterImage = issue?.images?.find((img) => img.image_type === 'AFTER')?.image_url;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Search Bar */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live Supabase Realtime Tracking
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Track Civic Issue Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Enter your unique Report ID to inspect live dispatch progress, field crew logs, and verified photographic resolution.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={inputReportId}
                onChange={(e) => setInputReportId(e.target.value)}
                placeholder="Enter Report ID (e.g. CF-20260830-1082)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Realtime Live Update Toast Announcement */}
        {liveUpdateAlert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <div className="text-xs font-bold text-white">
                LIVE REALTIME EVENT: <span className="text-cyan-300">{liveUpdateAlert}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Updated without page refresh</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Issue Details Card */}
        {issue && pConf && sConf && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details, Photos, Proof & Feedback */}
            <div className="lg:col-span-7 space-y-6">
              {/* Primary Info Card */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      {issue.report_id}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${pConf.bg} ${pConf.color} ${pConf.border}`}
                    >
                      {issue.priority_score} {issue.priority_level}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${sConf.bg} ${sConf.color} ${sConf.border}`}
                  >
                    {issue.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{catObj?.emoji}</span>
                    <span>{catObj?.label}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{issue.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {issue.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{issue.address}</span>
                  </div>
                  {issue.landmark && (
                    <div className="text-slate-400 text-[11px]">Landmark: {issue.landmark}</div>
                  )}
                  <div className="text-[10px] font-mono text-cyan-400">
                    GPS: {issue.latitude.toFixed(4)}° N, {issue.longitude.toFixed(4)}° E
                  </div>
                </div>
              </div>

              {/* Resolution Proof or Report Photo */}
              {beforeImage && afterImage ? (
                <BeforeAfterSlider beforeUrl={beforeImage} afterUrl={afterImage} />
              ) : reportImage ? (
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Citizen Photo Attached
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video">
                    <img
                      src={reportImage}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {/* Citizen Feedback Callout if Resolved */}
              {issue.status === 'Resolved' && !issue.feedback && (
                <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 p-6 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Resolution Complete • Rate This Fix</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Help us verify municipal crew accountability by rating the work completed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Give Citizen Feedback (1-5 Stars)</span>
                  </button>
                </div>
              )}

              {/* Existing Feedback Review */}
              {issue.feedback && (
                <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 shadow-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Your Verified Review
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      {'⭐'.repeat(issue.feedback.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{issue.feedback.comment}"
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Real-time Timeline Journey */}
            <div className="lg:col-span-5 space-y-6">
              <TimelineJourney issue={issue} />
            </div>
          </div>
        )}

        {/* Empty Search Prompt State */}
        {!issue && !loading && !errorMsg && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Radio className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Enter a Report ID to Track Live</h3>
              <p className="text-xs text-slate-400">
                Every submitted civic report receives a unique Report ID. Enter it above to view live dispatch progress and field crew actions.
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
        )}

        {/* Feedback Modal Dialog */}
        {issue && (
          <FeedbackModal
            issue={issue}
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            onSubmitted={() => fetchIssue(issue.id)}
          />
        )}
      </div>
    </div>
  );
};

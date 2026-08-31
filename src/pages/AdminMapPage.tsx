import React, { useEffect, useState } from 'react';
import {
  Compass,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Issue } from '../types';
import { issueService } from '../services/issueService';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants';
import { formatTimeAgo } from '../utils/formatters';
import { IssueDetailModal } from '../components/admin/IssueDetailModal';
import { AdminNavTabs } from '../components/admin/AdminNavTabs';

export const AdminMapPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [mapMode, setMapMode] = useState<'grid' | 'tactical'>('tactical');

  useEffect(() => {
    issueService.getIssues().then(setIssues);
  }, []);

  const filteredIssues = issues.filter(
    (i) => filterPriority === 'All' || i.priority_level === filterPriority
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Map Controls */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Geospatial Incident Grid
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Campus & City Hazard Map
            </h1>
            <p className="text-xs text-slate-400">
              Interactive GPS dispatch map with real-time severity clustering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminNavTabs />
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setMapMode('tactical')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mapMode === 'tactical'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tactical Dark
              </button>
              <button
                onClick={() => setMapMode('grid')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mapMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grid Vector
              </button>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter incidents by priority level"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer font-semibold"
            >
              <option value="All">All Priority Pins</option>
              <option value="critical">🔴 Critical Only</option>
              <option value="high">🟠 High Only</option>
              <option value="medium">🟡 Medium Only</option>
              <option value="low">🟢 Low Only</option>
            </select>
          </div>
        </div>

        {/* Tactical Map Container */}
        <div className="relative w-full h-[600px] rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Stylized Grid Lines and Map Terrain Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          {/* Simulated Campus/City Streets Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <path
              d="M 50 300 Q 250 150 450 300 T 850 300"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <path
              d="M 200 50 L 200 550"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
            <path
              d="M 600 50 L 600 550"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
            <path
              d="M 50 200 L 950 200"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
            <path
              d="M 50 450 L 950 450"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
          </svg>

          {/* Location Pins */}
          {filteredIssues.map((issue, index) => {
            const isCritical = issue.priority_level === 'critical';
            const pConf = PRIORITY_CONFIG[issue.priority_level];
            const isSelected = selectedIssue?.id === issue.id;

            // Compute pseudo coordinate positioning on visual grid for smooth rendering
            const posX = 15 + ((index * 27 + (issue.longitude * 100)) % 70);
            const posY = 15 + ((index * 33 + (issue.latitude * 100)) % 65);

            return (
              <div
                key={issue.id}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                onClick={() => setSelectedIssue(issue)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Ping animation for critical */}
                {isCritical && (
                  <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping" />
                )}

                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shadow-xl transition-all duration-300 group-hover:scale-125 ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 scale-125 bg-white text-slate-950 font-black'
                      : isCritical
                      ? 'bg-rose-600 text-white shadow-rose-500/40'
                      : issue.priority_level === 'high'
                      ? 'bg-amber-600 text-white shadow-amber-500/40'
                      : 'bg-cyan-600 text-white shadow-cyan-500/40'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>

                {/* Floating tooltip badge on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 border border-slate-700 px-2.5 py-1 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-30">
                  <div className="text-[10px] font-bold text-white">
                    {issue.report_id} • {issue.priority_score} {issue.priority_level}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slide-out Inspector for Selected Pin */}
          {selectedIssue && (
            <div className="absolute bottom-6 right-6 z-40 w-full max-w-sm rounded-3xl bg-slate-950/95 border border-slate-700 p-5 shadow-2xl backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white">
                      {selectedIssue.report_id}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        PRIORITY_CONFIG[selectedIssue.priority_level].bg
                      } ${PRIORITY_CONFIG[selectedIssue.priority_level].color} ${
                        PRIORITY_CONFIG[selectedIssue.priority_level].border
                      }`}
                    >
                      {selectedIssue.priority_score} {selectedIssue.priority_level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                    {selectedIssue.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 line-clamp-2">
                {selectedIssue.description}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{selectedIssue.address}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Dispatch</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Selected Pin */}
        <IssueDetailModal
          issue={selectedIssue}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onIssueUpdated={(up) => {
            setSelectedIssue(up);
            setIssues((prev) => prev.map((i) => (i.id === up.id ? up : i)));
          }}
        />
      </div>
    </div>
  );
};

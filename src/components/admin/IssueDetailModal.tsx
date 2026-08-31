import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileImage,
  HardHat,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Sparkles,
  Upload,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { CivicTeam, Issue, IssueStatus } from '../../types';
import { ISSUE_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { issueService } from '../../services/issueService';
import { teamService } from '../../services/teamService';
import { PriorityRadialMeter } from '../priority/PriorityRadialMeter';
import { calculatePriorityScore } from '../../services/priorityEngine';
import { BeforeAfterSlider } from '../tracking/BeforeAfterSlider';
import { TimelineJourney } from '../tracking/TimelineJourney';

interface Props {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueUpdated: (updated: Issue) => void;
}

export const IssueDetailModal: React.FC<Props> = ({
  issue,
  isOpen,
  onClose,
  onIssueUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue?.status || 'Submitted');
  const [statusNote, setStatusNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Teams state
  const [teams, setTeams] = useState<CivicTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(issue?.assigned_team_id || '');
  const [assigningTeam, setAssigningTeam] = useState(false);
  const [teamAssignSuccess, setTeamAssignSuccess] = useState(false);

  useEffect(() => {
    if (issue) {
      setSelectedStatus(issue.status);
      setSelectedTeamId(issue.assigned_team_id || '');
    }
  }, [issue?.id, issue?.status, issue?.assigned_team_id]);

  useEffect(() => {
    if (!isOpen || !issue) return;
    teamService.getTeams().then((data) => {
      setTeams(data);
      if (!issue.assigned_team_id) {
        const suggested = teamService.getSuggestedTeamForCategory(issue.category, data);
        if (suggested) {
          setSelectedTeamId(suggested.id);
        }
      } else {
        setSelectedTeamId(issue.assigned_team_id);
      }
    });
  }, [isOpen, issue?.id, issue?.category, issue?.assigned_team_id]);

  if (!isOpen || !issue) return null;

  const categoryObj = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
  const priorityConf = PRIORITY_CONFIG[issue.priority_level];
  const statusConf = STATUS_CONFIG[issue.status];

  // Images breakdown
  const reportImage = issue.images?.find((img) => img.image_type === 'REPORT')?.image_url;
  const beforeImage = issue.images?.find((img) => img.image_type === 'BEFORE')?.image_url || reportImage;
  const afterImage = issue.images?.find((img) => img.image_type === 'AFTER')?.image_url;

  const breakdown = calculatePriorityScore(
    issue.category,
    issue.severity,
    issue.people_affected,
    issue.address
  );

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const suggestedTeam = teamService.getSuggestedTeamForCategory(issue.category, teams);

  const handleAssignTeamSubmit = async () => {
    if (!selectedTeam) return;
    setAssigningTeam(true);
    try {
      const updated = await issueService.assignTeam({
        issueId: issue.id,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        teamLeader: selectedTeam.leader_name,
        teamPhone: selectedTeam.mobile_number,
        adminName: 'Sanjana Dhere (Admin)',
        updateStatusToAssigned: issue.status === 'Submitted' || issue.status === 'Under Review' || issue.status === 'Verified',
        note: `Assigned to ${selectedTeam.name} (Leader: ${selectedTeam.leader_name}, Mobile: ${selectedTeam.mobile_number}).`,
      });
      onIssueUpdated(updated);
      setSelectedStatus(updated.status);
      setTeamAssignSuccess(true);
      setTimeout(() => setTeamAssignSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to assign team:', err);
    } finally {
      setAssigningTeam(false);
    }
  };

  const handleStatusChangeSubmit = async () => {
    setUpdating(true);
    try {
      const updated = await issueService.updateStatus({
        issueId: issue.id,
        newStatus: selectedStatus,
        note: statusNote || undefined,
        adminName: 'Sanjana Dhere (Admin)',
      });
      onIssueUpdated(updated);
      setShowConfirm(false);
      setStatusNote('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'AFTER') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const url = await issueService.uploadImage(file);
      const updated = await issueService.addResolutionProof({
        issueId: issue.id,
        imageUrl: url,
        imageType: type,
      });
      onIssueUpdated(updated);
    } catch (err) {
      console.error('Proof upload failed:', err);
    } finally {
      setUploadingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 my-8 space-y-6 text-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-mono font-bold text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                {issue.report_id}
              </span>
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${priorityConf.bg} ${priorityConf.color} ${priorityConf.border}`}
              >
                {issue.priority_score} {issue.priority_level}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
              >
                {issue.status}
              </span>
              {issue.assigned_team_name && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5 text-cyan-400" />
                  {issue.assigned_team_name}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white pt-1">
              {issue.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Details, Photos, Team Assignment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Description & Citizen Info */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Issue Description
              </div>
              <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {issue.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Reported By</span>
                  <span className="font-semibold text-slate-200">
                    {issue.citizen_name || 'Citizen'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date Reported</span>
                  <span className="font-semibold text-slate-200">
                    {formatDate(issue.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Location & Coordinates
              </div>
              <div className="text-xs font-semibold text-white">{issue.address}</div>
              {issue.landmark && (
                <div className="text-xs text-slate-300">Landmark: {issue.landmark}</div>
              )}
              <div className="text-[11px] font-mono text-cyan-400 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                GPS: {issue.latitude.toFixed(4)}° N, {issue.longitude.toFixed(4)}° E
              </div>
            </div>

            {/* TEAM ASSIGNMENT & WORK ORDER DISPATCH PANEL */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Work Assignment (Municipal Team)
                  </h3>
                </div>
                {suggestedTeam && !issue.assigned_team_name && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Suggested: {suggestedTeam.name}
                  </span>
                )}
              </div>

              {teamAssignSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Team successfully assigned and dispatched live!</span>
                </div>
              )}

              {/* Team Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Select Assigned Response Team</span>
                  <span className="text-[11px] text-slate-400">
                    {teams.filter((t) => t.is_active).length} Active Crews
                  </span>
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-semibold focus:border-cyan-500 outline-none cursor-pointer"
                >
                  <option value="">-- Choose Municipal Team --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} • Leader: {t.leader_name} {t.id === suggestedTeam?.id ? '⭐ (Recommended)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Team Details Card */}
              {selectedTeam && (
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedTeam.name}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active Crew
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Team Leader</span>
                      <span className="font-semibold text-white">{selectedTeam.leader_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Contact Mobile</span>
                      <a
                        href={`tel:${selectedTeam.mobile_number}`}
                        className="font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        +91 {selectedTeam.mobile_number}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Action Button */}
              <button
                type="button"
                onClick={handleAssignTeamSubmit}
                disabled={!selectedTeamId || assigningTeam}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <HardHat className="w-4 h-4" />
                <span>
                  {assigningTeam
                    ? 'Dispatching Team...'
                    : issue.assigned_team_name
                    ? 'Update Team Assignment'
                    : 'Assign Team & Dispatch Work Order'}
                </span>
              </button>
            </div>

            {/* Photos & Before/After Proof Section */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Photographic Evidence</span>
                <span className="text-[10px] text-cyan-400">Resolution Proof</span>
              </div>

              {beforeImage && afterImage ? (
                <BeforeAfterSlider beforeUrl={beforeImage} afterUrl={afterImage} />
              ) : reportImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video group">
                  <img
                    src={reportImage}
                    alt="Citizen report photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold uppercase text-slate-200 border border-slate-800">
                    Original Report Photo
                  </div>
                </div>
              ) : (
                <div className="py-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  No citizen photo attached
                </div>
              )}

              {/* Admin Proof Upload Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Admin Proof Manager
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 cursor-pointer bg-slate-900/60 text-xs text-slate-300 transition-colors">
                    <Upload className="w-4 h-4 text-cyan-400 mb-1" />
                    <span>{beforeImage ? 'Replace Before' : 'Upload Before'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProofUpload(e, 'BEFORE')}
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer bg-slate-900/60 text-xs text-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                    <span>{afterImage ? 'Replace After' : 'Upload After (Fixed)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProofUpload(e, 'AFTER')}
                    />
                  </label>
                </div>
                {uploadingProof && (
                  <div className="text-[11px] text-cyan-400 animate-pulse text-center">
                    Uploading proof image...
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Feedback if Available */}
            {issue.feedback && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Citizen Resolution Review
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {'⭐'.repeat(issue.feedback.rating)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{issue.feedback.comment}"
                </p>
                <div className="text-[10px] text-slate-400">
                  By {issue.feedback.citizen_name || 'Citizen'} •{' '}
                  {formatDate(issue.feedback.created_at)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Admin Dispatch Controls & Timeline */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Change Control Panel */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-rose-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Admin Status Dispatch
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-rose-400">Role: Admin</span>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Update Issue Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as IssueStatus)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-semibold focus:border-cyan-500 outline-none cursor-pointer"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified (+50 Pts)</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Work Started">Work Started</option>
                  <option value="Resolved">Resolved (+100 Pts & Proof)</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Duplicate">Duplicate</option>
                </select>
              </div>

              {/* Dispatch Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Dispatch Note / Work Order Remarks
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Maintenance crew dispatched with materials; repair completed."
                  rows={2}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Status Confirmation Dialog */}
              {showConfirm ? (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-rose-300">
                    Change status to{' '}
                    <span className="uppercase text-white font-extrabold underline">
                      {selectedStatus}
                    </span>
                    ?
                  </div>
                  <p className="text-[11px] text-slate-300">
                    This will broadcast live updates via Supabase Realtime to the citizen's screen.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleStatusChangeSubmit}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-500/30 hover:scale-[1.02] transition-transform"
                    >
                      {updating ? 'Updating...' : 'Confirm Update'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={selectedStatus === issue.status && !statusNote}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Apply Status Change
                </button>
              )}
            </div>

            {/* Smart Priority Calculation Card */}
            <PriorityRadialMeter breakdown={breakdown} interactive={false} />

            {/* Realtime Journey Timeline */}
            <TimelineJourney issue={issue} />
          </div>
        </div>
      </div>
    </div>
  );
};

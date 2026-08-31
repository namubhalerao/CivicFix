import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  HardHat,
  Layers,
  Phone,
  Plus,
  Radio,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { CivicTeam, Issue } from '../types';
import { teamService } from '../services/teamService';
import { issueService } from '../services/issueService';
import { AdminNavTabs } from '../components/admin/AdminNavTabs';
import { realtimeBus } from '../lib/supabase';

export const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<CivicTeam[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Team Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [teamsData, issuesData] = await Promise.all([
        teamService.getTeams(),
        issueService.getIssues(),
      ]);
      setTeams(teamsData);
      setIssues(issuesData);
    } catch (err) {
      console.error('Failed to load teams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates
    const unsubTeams = realtimeBus.subscribe<CivicTeam[]>('teams_updated', (updatedList) => {
      setTeams(updatedList);
    });

    const unsubIssues = realtimeBus.subscribe<Issue[]>('issues_list_changed', (updatedIssues) => {
      setIssues(updatedIssues);
    });

    return () => {
      unsubTeams();
      unsubIssues();
    };
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!teamName.trim()) {
      setModalError('Please provide a valid team name.');
      return;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setModalError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      return;
    }

    setSubmitting(true);
    try {
      await teamService.createTeam({
        name: teamName.trim(),
        leader_name: leaderName.trim() || undefined,
        mobile_number: cleanPhone,
      });

      setIsAddModalOpen(false);
      setTeamName('');
      setLeaderName('');
      setMobileNumber('');
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (teamId: string) => {
    try {
      await teamService.toggleTeamStatus(teamId);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle team status:', err);
    }
  };

  // Compute assigned counts for each team
  const teamsWithCounts = teams.map((team) => {
    const assignedIssues = issues.filter(
      (i) => i.assigned_team_id === team.id || (i.assigned_team_name && i.assigned_team_name.toLowerCase() === team.name.toLowerCase())
    );
    const openAssigned = assignedIssues.filter(
      (i) => i.status !== 'Resolved' && i.status !== 'Closed' && i.status !== 'Rejected'
    );
    return {
      ...team,
      total_assigned: assignedIssues.length,
      open_assigned: openAssigned.length,
    };
  });

  const filteredTeams = teamsWithCounts.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.leader_name.toLowerCase().includes(q) ||
      t.mobile_number.includes(q)
    );
  });

  const activeTeamsCount = teams.filter((t) => t.is_active).length;
  const totalAssignedWork = issues.filter((i) => i.assigned_team_name || i.assigned_team_id).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Admin Dispatch & Work Units
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Municipal Response Teams
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Manage specialized municipal crews, dispatch assignments, and track active work allocation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminNavTabs />
            <button
              onClick={() => {
                setIsAddModalOpen(true);
                setModalError('');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Team</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Total Teams</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{teams.length}</div>
            <p className="text-[11px] text-slate-400">Default & custom response crews</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Active Deployable</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{activeTeamsCount}</div>
            <p className="text-[11px] text-slate-400">Available for live incident dispatch</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Total Assigned Work</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">{totalAssignedWork}</div>
            <p className="text-[11px] text-slate-400">Civic tickets currently under assignment</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Sync Mode</span>
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="text-xl font-extrabold font-mono text-cyan-400 pt-1">Realtime Live</div>
            <p className="text-[11px] text-slate-400">Instant updates to citizen tracking</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team name, leader, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-white">{filteredTeams.length}</span> of{' '}
            <span className="font-bold text-white">{teams.length}</span> teams
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeams.map((team) => {
            return (
              <div
                key={team.id}
                className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleToggleStatus(team.id)}
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition-all ${
                        team.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {team.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{team.leader_name}</span>
                    </div>
                  </div>
                </div>

                {/* Team Contact & Work stats */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      Contact:
                    </span>
                    <a
                      href={`tel:${team.mobile_number}`}
                      className="font-mono font-bold text-white hover:text-cyan-400 transition-colors"
                    >
                      +91 {team.mobile_number}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Open Work</div>
                      <div className="text-sm font-extrabold font-mono text-cyan-400">
                        {team.open_assigned}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Assigned</div>
                      <div className="text-sm font-extrabold font-mono text-slate-200">
                        {team.total_assigned}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Team Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 text-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">Add New Municipal Team</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Team Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Storm Drain Emergency Crew"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Team Leader / Contact Person
                  </label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mobile Number (10 digits) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Used by admin for SMS/dispatch alerts. No worker credentials needed.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin-Only Assignment Model</span>
                  </div>
                  <p className="text-slate-300">
                    Teams are operational work units. They will immediately appear in the Issue Assignment dropdown.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Creating Team...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

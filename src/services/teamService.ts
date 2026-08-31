import { CivicTeam, IssueCategory } from '../types';
import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';

const LOCAL_STORAGE_KEY_TEAMS = 'civicfix_teams_v1';

export const DEFAULT_MUNICIPAL_TEAMS: CivicTeam[] = [
  {
    id: 'team-road',
    name: 'Road & Pothole Team',
    leader_name: 'Amol Patil',
    mobile_number: '9876543210',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-garbage',
    name: 'Garbage & Sanitation Team',
    leader_name: 'Sagar Jadhav',
    mobile_number: '9876543211',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-streetlight',
    name: 'Streetlight Team',
    leader_name: 'Nikhil Shinde',
    mobile_number: '9876543212',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-water',
    name: 'Water & Leakage Team',
    leader_name: 'Rohit Deshmukh',
    mobile_number: '9876543213',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-traffic',
    name: 'Traffic Management Team',
    leader_name: 'Akash Pawar',
    mobile_number: '9876543214',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-tree',
    name: 'Tree & Environment Team',
    leader_name: 'Pratik More',
    mobile_number: '9876543215',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-electrical',
    name: 'Electrical Team',
    leader_name: 'Mahesh Chavan',
    mobile_number: '9876543216',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'team-general',
    name: 'General Civic Team',
    leader_name: 'Kunal Bhosale',
    mobile_number: '9876543217',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
];

function getStoredTeams(): CivicTeam[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TEAMS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_TEAMS, JSON.stringify(DEFAULT_MUNICIPAL_TEAMS));
      return DEFAULT_MUNICIPAL_TEAMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_TEAMS, JSON.stringify(DEFAULT_MUNICIPAL_TEAMS));
    return DEFAULT_MUNICIPAL_TEAMS;
  } catch (e) {
    return DEFAULT_MUNICIPAL_TEAMS;
  }
}

function saveStoredTeams(teams: CivicTeam[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to persist teams to localStorage', e);
  }
}

export const teamService = {
  /**
   * Fetch all teams (from Supabase if configured or LocalStorage)
   */
  async getTeams(): Promise<CivicTeam[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          saveStoredTeams(data as CivicTeam[]);
          return data as CivicTeam[];
        }

        // If table exists but is empty, seed defaults
        if (!error && data && data.length === 0) {
          await supabase.from('teams').insert(
            DEFAULT_MUNICIPAL_TEAMS.map((t) => ({
              id: t.id,
              name: t.name,
              leader_name: t.leader_name,
              mobile_number: t.mobile_number,
              is_active: t.is_active,
            }))
          );
          return DEFAULT_MUNICIPAL_TEAMS;
        }
      } catch (err) {
        console.warn('Supabase getTeams error, falling back to local store:', err);
      }
    }

    return getStoredTeams();
  },

  /**
   * Smart default recommendation based on issue category
   */
  getSuggestedTeamForCategory(category: IssueCategory, teams: CivicTeam[]): CivicTeam | undefined {
    const categoryMap: Record<IssueCategory, string> = {
      pothole: 'Road & Pothole Team',
      garbage: 'Garbage & Sanitation Team',
      streetlight: 'Streetlight Team',
      water_leak: 'Water & Leakage Team',
      traffic: 'Traffic Management Team',
      tree: 'Tree & Environment Team',
      electrical: 'Electrical Team',
      other: 'General Civic Team',
    };

    const targetName = categoryMap[category] || 'General Civic Team';
    return (
      teams.find((t) => t.name.toLowerCase() === targetName.toLowerCase()) ||
      teams.find((t) => t.is_active) ||
      teams[0]
    );
  },

  /**
   * Create a new team (No worker accounts, only name, leader and 10-digit mobile)
   */
  async createTeam(params: {
    name: string;
    leader_name?: string;
    mobile_number: string;
  }): Promise<CivicTeam> {
    const cleanName = params.name.trim();
    const cleanPhone = params.mobile_number.replace(/\D/g, '');

    if (!cleanName) {
      throw new Error('Team name is required.');
    }

    // Validate 10-digit Indian phone number
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    const leaderName = (params.leader_name && params.leader_name.trim()) || `${cleanName.split(' ')[0]} Lead Officer`;

    const newTeam: CivicTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      leader_name: leaderName,
      mobile_number: cleanPhone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to LocalStorage
    const current = getStoredTeams();
    const existing = current.find((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      throw new Error(`A team with name "${cleanName}" already exists.`);
    }

    const updatedList = [...current, newTeam];
    saveStoredTeams(updatedList);

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('teams').insert([
          {
            id: newTeam.id,
            name: newTeam.name,
            leader_name: newTeam.leader_name,
            mobile_number: newTeam.mobile_number,
            is_active: newTeam.is_active,
          },
        ]);
      } catch (err) {
        console.warn('Supabase team insert error:', err);
      }
    }

    realtimeBus.emit('team_created', newTeam);
    realtimeBus.emit('teams_updated', updatedList);

    return newTeam;
  },

  /**
   * Toggle Active / Inactive Status
   */
  async toggleTeamStatus(teamId: string): Promise<CivicTeam> {
    const list = getStoredTeams();
    const idx = list.findIndex((t) => t.id === teamId);
    if (idx === -1) throw new Error('Team not found');

    const updatedTeam: CivicTeam = {
      ...list[idx],
      is_active: !list[idx].is_active,
      updated_at: new Date().toISOString(),
    };

    list[idx] = updatedTeam;
    saveStoredTeams(list);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('teams')
          .update({ is_active: updatedTeam.is_active, updated_at: updatedTeam.updated_at })
          .eq('id', teamId);
      } catch (err) {
        console.warn('Supabase toggle team status error:', err);
      }
    }

    realtimeBus.emit('teams_updated', list);
    return updatedTeam;
  },
};

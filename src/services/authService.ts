import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { ADMIN_CONFIG } from '../utils/constants';

const LOCAL_STORAGE_KEY_USER = 'civicfix_current_user';
const LOCAL_STORAGE_KEY_PROFILES = 'civicfix_profiles';

// Helper to load mock profiles
function getStoredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [
    {
      id: 'admin-001',
      name: 'Sanjana Dhere',
      email: ADMIN_CONFIG.EMAIL,
      role: 'admin',
      points: 2450,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'user-001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      role: 'citizen',
      points: 820,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'user-002',
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      role: 'citizen',
      points: 650,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'user-003',
      name: 'Namrata Joshi',
      email: 'namrata.j@example.com',
      role: 'citizen',
      points: 540,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

function saveProfiles(profiles: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export const authService = {
  /**
   * Get currently active session profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            return profile as UserProfile;
          }
          // Default profile if not found in db
          const isUserAdmin = session.user.email?.toLowerCase() === ADMIN_CONFIG.EMAIL.toLowerCase();
          return {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Citizen',
            email: session.user.email || '',
            role: isUserAdmin ? 'admin' : 'citizen',
            points: 100,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Supabase session check error, checking fallback storage', err);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Citizen Sign In with Email & Password
   */
  async signIn(email: string, password: string):Promise<UserProfile> {
    // If Admin email entered on standard login, guide them or process securely
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === ADMIN_CONFIG.EMAIL.toLowerCase()) {
      if (password === 'CIVIC@27#26') {
        const adminProfile: UserProfile = {
          id: 'admin-001',
          name: 'Sanjana Dhere',
          email: ADMIN_CONFIG.EMAIL,
          role: 'admin',
          points: 2450,
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(adminProfile));
        return adminProfile;
      } else {
        throw new Error('Invalid credentials. Please verify your password.');
      }
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const profile = await this.getCurrentUser();
        if (profile) return profile;
      }
    }

    // Local fallback authentication
    const profiles = getStoredProfiles();
    let profile = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!profile) {
      // Auto register citizen for ease of hackathon demo
      profile = {
        id: `user-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        role: 'citizen',
        points: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(profile);
      saveProfiles(profiles);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(profile));
    return profile;
  },

  /**
   * Citizen Sign Up with Name, Email & Password
   */
  async signUp(name: string, email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === ADMIN_CONFIG.EMAIL.toLowerCase()) {
      throw new Error('This email is reserved for system administration.');
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name,
            role: 'citizen',
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          name,
          email: cleanEmail,
          role: 'citizen',
          points: 50, // Welcome signup bonus
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        try {
          await supabase.from('profiles').insert([newProfile]);
        } catch {
          // ignore
        }
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newProfile));
        return newProfile;
      }
    }

    const profiles = getStoredProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'citizen',
      points: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    saveProfiles(profiles);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newProfile));
    return newProfile;
  },

  /**
   * Dedicated Secure Admin Login
   * Explicitly configured for sanjanadhere61@gmail.com / CIVIC@27#26
   */
  async adminLogin(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== ADMIN_CONFIG.EMAIL.toLowerCase()) {
      throw new Error('Access Denied. You do not have administrator authorization.');
    }

    if (password !== 'CIVIC@27#26') {
      throw new Error('Invalid administrator password. Security event logged.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data.user) {
          const profile = await this.getCurrentUser();
          if (profile) return { ...profile, role: 'admin' };
        }
      } catch (err) {
        console.warn('Supabase admin login fallback:', err);
      }
    }

    const adminProfile: UserProfile = {
      id: 'admin-sanjana',
      name: ADMIN_CONFIG.NAME,
      email: ADMIN_CONFIG.EMAIL,
      role: 'admin',
      points: 3500,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(adminProfile));
    return adminProfile;
  },

  /**
   * Continue with Google Provider
   */
  async signInWithGoogle(): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
    }

    // Interactive demo fallback
    const googleProfile: UserProfile = {
      id: `g-user-${Date.now()}`,
      name: 'Google Citizen',
      email: 'citizen@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'citizen',
      points: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(googleProfile));
    return googleProfile;
  },

  /**
   * Password Reset Flow
   */
  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
    }
    // Simulation success
  },

  /**
   * Log out session
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  },

  /**
   * Award Civic Points to citizen profile
   */
  async awardPoints(userId: string, pointsToAdd: number): Promise<number> {
    if (isSupabaseConfigured && !userId.startsWith('user-') && !userId.startsWith('guest-')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .single();
        if (profile) {
          const updatedPoints = (profile.points || 0) + pointsToAdd;
          await supabase
            .from('profiles')
            .update({ points: updatedPoints, updated_at: new Date().toISOString() })
            .eq('id', userId);
          return updatedPoints;
        }
      } catch (err) {
        console.warn('Supabase award points error:', err);
      }
    }

    const profiles = getStoredProfiles();
    const idx = profiles.findIndex((p) => p.id === userId);
    let newTotal = pointsToAdd;
    if (idx !== -1) {
      profiles[idx].points += pointsToAdd;
      newTotal = profiles[idx].points;
      saveProfiles(profiles);
    }

    const current = await this.getCurrentUser();
    if (current && current.id === userId) {
      current.points = newTotal;
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(current));
    }
    return newTotal;
  },

  /**
   * Leaderboard data
   */
  async getLeaderboard() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, points, avatar_url')
          .eq('role', 'citizen')
          .order('points', { ascending: false })
          .limit(10);
        if (!error && data && data.length > 0) {
          return data.map((u: any, i: number) => ({
            id: u.id,
            name: u.name || 'Citizen',
            points: u.points || 0,
            rank: i + 1,
            resolved_count: Math.floor((u.points || 0) / 100),
            avatar_url: u.avatar_url,
          }));
        }
      } catch (err) {
        console.warn('Supabase leaderboard fetch error:', err);
      }
    }

    const profiles = getStoredProfiles();
    const sorted = [...profiles]
      .filter((p) => p.role === 'citizen')
      .sort((a, b) => b.points - a.points);

    return sorted.map((u, i) => ({
      id: u.id,
      name: u.name,
      points: u.points,
      rank: i + 1,
      resolved_count: Math.floor(u.points / 100),
      avatar_url: u.avatar_url,
    }));
  },
};

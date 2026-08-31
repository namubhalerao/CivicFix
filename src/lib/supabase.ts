import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('mock-instance')
);

// Real Supabase client instance (or dummy instance if credentials aren't set yet)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-instance.supabase.co', 'mock-anon-key');

/**
 * Event bus for seamless Realtime synchronization across all tabs and components
 */
type Listener<T = any> = (data: T) => void;

class RealtimeEventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe<T>(channel: string, callback: Listener<T>) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    // Return cleanup unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  emit<T>(channel: string, data: T) {
    // Notify in-process listeners
    if (this.listeners.has(channel)) {
      this.listeners.get(channel)!.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in realtime subscriber on channel "${channel}":`, err);
        }
      });
    }

    // Broadcast across browser tabs via storage event if in browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `civicfix_rt_${channel}`,
          JSON.stringify({ timestamp: Date.now(), data })
        );
      } catch (e) {
        // Ignore quota errors
      }
    }
  }
}

export const realtimeBus = new RealtimeEventBus();

// Cross-tab real-time listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('civicfix_rt_') && e.newValue) {
      try {
        const channel = e.key.replace('civicfix_rt_', '');
        const parsed = JSON.parse(e.newValue);
        realtimeBus.emit(channel, parsed.data);
      } catch (err) {
        // Ignore
      }
    }
  });
}

// Initialize Supabase Postgres Live Channels when credentials configured
if (isSupabaseConfigured) {
  try {
    supabase
      .channel('public:issues_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues' },
        (payload: any) => {
          if (payload.new) {
            realtimeBus.emit('issue_updated', payload.new);
            realtimeBus.emit(`issue_${payload.new.id}`, payload.new);
            if (payload.new.report_id) {
              realtimeBus.emit(`issue_${payload.new.report_id}`, payload.new);
            }
            realtimeBus.emit('issues_channel', payload.new);
          }
        }
      )
      .subscribe();

    supabase
      .channel('public:notifications_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          if (payload.new) {
            realtimeBus.emit('new_notification', payload.new);
            if (payload.new.user_id) {
              realtimeBus.emit(`notifications_${payload.new.user_id}`, payload.new);
            }
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Could not initialize Supabase Realtime channels:', err);
  }
}

